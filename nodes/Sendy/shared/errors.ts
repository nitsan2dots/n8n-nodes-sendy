import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INode,
	INodeExecutionData,
	INodePropertyRouting,
	JsonObject,
	PostReceiveAction,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

type SendyErrorEnvelope = { error: { code: string; message: string; details?: unknown } };

function isSendyErrorEnvelope(body: unknown): body is SendyErrorEnvelope {
	if (!body || typeof body !== 'object') return false;
	const error = (body as { error?: unknown }).error;
	return (
		!!error &&
		typeof error === 'object' &&
		typeof (error as { code?: unknown }).code === 'string' &&
		typeof (error as { message?: unknown }).message === 'string'
	);
}

/**
 * Builds the error the node raises for a non-2xx Sendy response.
 *
 * The message is `CODE: message` from Sendy's `{ error: { code, message } }` envelope because n8n
 * puts ONLY `error.message` into `$json.error` on the error output and on "Continue". Left to n8n,
 * the message is a status-code text instead ("Forbidden - perhaps check your credentials?" for a
 * 403), which sends a user with an unapproved sender or no credits off to check a key that is fine.
 * A body that is not the envelope (a proxy's HTML 502, say) falls back to n8n's own status text.
 */
export function sendyApiError(node: INode, statusCode: number, body: unknown): NodeApiError {
	const httpCode = String(statusCode);
	if (!isSendyErrorEnvelope(body)) {
		return new NodeApiError(node, (body && typeof body === 'object' ? body : {}) as JsonObject, {
			httpCode,
		});
	}
	const { code, message, details } = body.error;
	// Set explicitly: left empty, n8n copies Sendy's message into the description and the editor
	// shows it twice.
	const description: string[] = [];
	if (Array.isArray(details)) {
		for (const detail of details as Array<{ path?: unknown; message?: unknown }>) {
			if (typeof detail?.message !== 'string') continue;
			description.push(detail.path ? `${String(detail.path)}: ${detail.message}` : detail.message);
		}
	}
	if (statusCode === 401) {
		description.push(
			'Check the API key in the Sendy SMS API credential. Keys are created under Developers in Sendy.',
		);
	}
	description.push(`HTTP ${httpCode} from the Sendy API.`);
	return new NodeApiError(node, body as unknown as JsonObject, {
		message: `${code}: ${message}`,
		description: description.join('\n'),
		httpCode,
	});
}

/**
 * Routing for a Sendy operation: the request plus the status check that has to go with it.
 *
 * `ignoreHttpStatusErrors` stops n8n from turning a 4xx into its generic error before the body is
 * read, so the check in `postReceive` has to run on every request that sets it, or an error body
 * would come out as a success item. Keeping both in one helper means an operation gets both or
 * neither. The check runs first: ahead of the operation's own `postReceive` (passed here) and of
 * the field-level ones (such as the `rootProperty: data` unwrap on Get Many), so an error body never
 * reaches an unwrap. The cursor pagination requests inherit the option and check every page.
 */
export function sendyRouting(
	request: Partial<IHttpRequestOptions>,
	postReceive: PostReceiveAction[] = [],
): INodePropertyRouting {
	return {
		request: { ...request, ignoreHttpStatusErrors: true },
		output: { postReceive: [throwOnSendyError, ...postReceive] },
	};
}

async function throwOnSendyError(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (response.statusCode >= 400) {
		throw sendyApiError(this.getNode(), response.statusCode, response.body);
	}
	return items;
}

import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { sendyApiError } from './errors';

/**
 * Authenticated request against the Sendy public API, used by the `loadOptions` dropdowns (the
 * declarative resource operations route their own requests). The base URL comes from the
 * credential so a user can point the node at staging / a self-hosted instance without editing code.
 * A non-2xx answer throws Sendy's own `CODE: message` (see `sendyApiError`), so a dropdown with a
 * bad key says INVALID_API_KEY rather than n8n's generic status text.
 */
export async function sendyApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('sendySmsApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${baseUrl}${resource}`,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'sendySmsApi',
		options,
	)) as IN8nHttpFullResponse;
	if (response.statusCode >= 400) {
		throw sendyApiError(this.getNode(), response.statusCode, response.body);
	}
	return response.body as IDataObject;
}

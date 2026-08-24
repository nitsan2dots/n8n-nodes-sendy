import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { sendyApiRequest } from '../shared/transport';

type Sender = { value: string; type: string };

/**
 * Feeds the "From" dropdown on Send SMS with the workspace's APPROVED sender IDs.
 *
 * `value` is sent to the API verbatim — the server matches `from` literally, so a reformatted
 * number is rejected as SENDER_NOT_APPROVED. Only the display name is decorated: since 2026-08 a
 * workspace holding a virtual number gets it as an automatically approved PHONE sender, which
 * would otherwise appear as a bare `+972…` with nothing saying what it is.
 */
export async function getSenders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const response = await sendyApiRequest.call(this, 'GET', '/senders');
	const senders = (response.senders as Sender[]) ?? [];
	return senders.map((sender) => ({
		name:
			sender.type === 'PHONE'
				? `${sender.value} (phone number)`
				: `${sender.value} (text sender)`,
		value: sender.value,
	}));
}

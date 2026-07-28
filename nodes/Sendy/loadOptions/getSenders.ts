import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { sendyApiRequest } from '../shared/transport';

type Sender = { value: string; type: string };

/** Feeds the "From" dropdown on Send SMS with the workspace's APPROVED sender IDs. */
export async function getSenders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const response = await sendyApiRequest.call(this, 'GET', '/senders');
	const senders = (response.senders as Sender[]) ?? [];
	return senders.map((sender) => ({
		name: `${sender.value} (${sender.type})`,
		value: sender.value,
	}));
}

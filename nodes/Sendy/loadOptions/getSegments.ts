import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { sendyApiRequest } from '../shared/transport';

type Segment = { id: string; name: string };

/** Feeds the "Segments" dropdown on Create/Update a Contact — the user picks names, the API gets ids. */
export async function getSegments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const response = await sendyApiRequest.call(this, 'GET', '/segments');
	const segments = (response.segments as Segment[]) ?? [];
	return segments.map((segment) => ({
		name: segment.name,
		value: segment.id,
	}));
}

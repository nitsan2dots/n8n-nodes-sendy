import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

import { messageDescription } from './resources/message';
import { contactDescription } from './resources/contact';
import { segmentDescription } from './resources/segment';
import { senderDescription } from './resources/sender';
import { customFieldDescription } from './resources/customField';
import { creditDescription } from './resources/credit';

import { getSenders } from './loadOptions/getSenders';
import { getSegments } from './loadOptions/getSegments';

export class Sendy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sendy',
		name: 'sendy',
		icon: { light: 'file:../../icons/sendy.svg', dark: 'file:../../icons/sendy.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send SMS and manage contacts, segments and credits with Sendy',
		defaults: {
			name: 'Sendy',
		},
		usableAsTool: true,
		// Use the 'main' string literal, NOT NodeConnectionTypes.Main. In a multi-community-node
		// install, npm hoists the latest PUBLIC n8n-workflow (1.x) into ~/.n8n/nodes/node_modules,
		// shadowing n8n's bundled 2.x. 1.x exports the singular `NodeConnectionType` but NOT the
		// plural `NodeConnectionTypes`, so `NodeConnectionTypes.Main` reads `.Main` off undefined →
		// TypeError at load, which n8n surfaces as "Class could not be found". The literal 'main'
		// equals `.Main` in every version and needs no runtime symbol (the import above is type-only,
		// so the compiled node never `require`s n8n-workflow at all). See docs/integrations/n8n-node.md.
		// eslint-disable-next-line @n8n/community-nodes/node-connection-type-literal
		inputs: ['main'],
		// eslint-disable-next-line @n8n/community-nodes/node-connection-type-literal
		outputs: ['main'],
		credentials: [
			{
				name: 'sendyApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Credit',
						value: 'credit',
					},
					{
						name: 'Custom Field',
						value: 'customField',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Segment',
						value: 'segment',
					},
					{
						name: 'Sender',
						value: 'sender',
					},
				],
				default: 'message',
			},
			...messageDescription,
			...contactDescription,
			...segmentDescription,
			...senderDescription,
			...customFieldDescription,
			...creditDescription,
		],
	};

	methods = {
		loadOptions: {
			getSenders,
			getSegments,
		},
	};
}

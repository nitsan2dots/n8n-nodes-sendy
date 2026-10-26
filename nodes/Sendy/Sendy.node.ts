import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { messageDescription } from './resources/message';
import { contactDescription } from './resources/contact';
import { segmentDescription } from './resources/segment';
import { senderDescription } from './resources/sender';
import { customFieldDescription } from './resources/customField';
import { creditDescription } from './resources/credit';
import { inboundDescription } from './resources/inbound';
import { virtualNumberDescription } from './resources/virtualNumber';

import { getSenders } from './loadOptions/getSenders';
import { getSegments } from './loadOptions/getSegments';

export class Sendy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sendy SMS',
		name: 'sendy',
		icon: { light: 'file:../../icons/sendy.svg', dark: 'file:../../icons/sendy.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send SMS, read replies to your virtual number, and manage contacts, segments and credits with Sendy',
		defaults: {
			name: 'Sendy SMS',
		},
		usableAsTool: true,
		// `NodeConnectionTypes.Main` with a `'main'` fallback, kept as an expression on purpose.
		// The scanner gate (node-connection-type-literal) forbids the bare 'main' literal that
		// 0.1.1 to 0.4.0 used, but a bare `NodeConnectionTypes.Main` still breaks one real install
		// shape: n8n before 1.100 installed community nodes with a plain `npm install` in
		// ~/.n8n/nodes, which hoisted the peer n8n-workflow there, and that copy outlives upgrades.
		// Old copies (1.82.0 checked) export only the singular `NodeConnectionType`, so `.Main` would
		// be read off undefined at load and n8n reports "Class could not be found". n8n 1.100+ strips
		// peer dependencies on install, and n8n-workflow 1.120 and every 2.x export the plural, so
		// the fallback only fires on such leftovers; 'main' equals `.Main` in every version.
		// See docs/integrations/n8n-node.md in the Sendy repo.
		inputs: [NodeConnectionTypes?.Main ?? 'main'],
		outputs: [NodeConnectionTypes?.Main ?? 'main'],
		credentials: [
			{
				name: 'sendySmsApi',
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
						name: 'Inbound Message',
						value: 'inbound',
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
					{
						name: 'Virtual Number',
						value: 'virtualNumber',
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
			...inboundDescription,
			...virtualNumberDescription,
		],
	};

	methods = {
		loadOptions: {
			getSenders,
			getSegments,
		},
	};
}

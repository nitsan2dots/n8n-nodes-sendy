import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMessageSend = {
	operation: ['send'],
	resource: ['message'],
};

export const messageSendDescription: INodeProperties[] = [
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 972501234567',
		displayOptions: { show: showOnlyForMessageSend },
		description: 'Recipient phone number. Israeli numbers are normalized automatically (the + is optional).',
		routing: {
			send: { type: 'body', property: 'to' },
		},
	},
	{
		displayName: 'Sender Name or ID',
		name: 'from',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getSenders' },
		default: '',
		required: true,
		displayOptions: { show: showOnlyForMessageSend },
		description:
			'Approved sender to send from. Only approved senders work. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: {
			send: { type: 'body', property: 'from' },
		},
	},
	{
		displayName: 'Message',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: showOnlyForMessageSend },
		description: 'The SMS text. Billed 1 credit per 201 characters, any encoding.',
		routing: {
			send: { type: 'body', property: 'body' },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForMessageSend },
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description:
					'Unique key to safely retry a send without double-charging. A repeat with the same key returns the original message.',
				routing: {
					request: {
						headers: { 'Idempotency-Key': '={{$value}}' },
					},
				},
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Marketing',
						value: 'marketing',
						description: 'Skips recipients unsubscribed in this workspace (no charge for them)',
					},
					{
						name: 'Transactional',
						value: 'transactional',
						description: 'Declares the message is not marketing content and skips the opt-out check',
					},
				],
				default: 'marketing',
				description:
					'Send purpose. Omit to use the workspace default. Choose Marketing to respect opt-outs.',
				routing: {
					send: { type: 'body', property: 'mode' },
				},
			},
		],
	},
];

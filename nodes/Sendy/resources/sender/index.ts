import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSenders = {
	resource: ['sender'],
};

export const senderDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSenders },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many senders',
				description: 'List the workspace approved sender IDs usable as From',
				routing: {
					request: {
						method: 'GET',
						url: '/senders',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'senders' },
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
];

import type { INodeProperties } from 'n8n-workflow';

const showOnlyForInbound = {
	resource: ['inbound'],
};

const showOnlyForInboundGetMany = {
	operation: ['getAll'],
	resource: ['inbound'],
};

export const inboundDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForInbound },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many inbound messages',
				description: 'List SMS replies received on the workspace virtual number',
				routing: {
					request: {
						method: 'GET',
						url: '/inbound',
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForInboundGetMany },
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
				type: 'query',
				property: 'limit',
				value: '100',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response.body.has_more === true }}',
						request: {
							qs: { cursor: '={{ $response.body.next_cursor }}' },
						},
					},
				},
			},
			// Keep the unwrap on the ALWAYS-displayed field only. n8n concatenates the postReceive
			// lists of every displayed field, so declaring it on `limit` too would unwrap `data`
			// twice on the returnAll=false path and yield undefined rows (the 0.1.0 Contact bug).
			output: {
				postReceive: [
					{
						type: 'rootProperty',
						properties: { property: 'data' },
					},
				],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: { ...showOnlyForInboundGetMany, returnAll: [false] },
		},
		description: 'Max number of results to return',
		routing: {
			send: { type: 'query', property: 'limit' },
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: showOnlyForInboundGetMany },
		options: [
			{
				displayName: 'Received Since',
				name: 'since',
				type: 'dateTime',
				default: '',
				description:
					'Only return messages received at or after this time. Messages come back oldest-first, so use this with a Schedule trigger to poll for new replies.',
				routing: {
					send: { type: 'query', property: 'since' },
				},
			},
		],
	},
];

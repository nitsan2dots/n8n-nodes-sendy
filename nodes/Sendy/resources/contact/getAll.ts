import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactGetMany = {
	operation: ['getAll'],
	resource: ['contact'],
};

export const contactGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForContactGetMany },
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
			show: { ...showOnlyForContactGetMany, returnAll: [false] },
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
		displayOptions: { show: showOnlyForContactGetMany },
		options: [
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: 'e.g. 972501234567',
				description: 'Return only the contact with this exact phone number',
				routing: {
					send: { type: 'query', property: 'phone' },
				},
			},
		],
	},
];

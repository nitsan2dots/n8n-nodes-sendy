import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCustomFields = {
	resource: ['customField'],
};

export const customFieldDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForCustomFields },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many custom fields',
				description: 'List the workspace active custom field slots and their labels',
				routing: {
					request: {
						method: 'GET',
						url: '/custom-fields',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'custom_fields' },
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
];

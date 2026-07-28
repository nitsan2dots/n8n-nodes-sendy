import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCredits = {
	resource: ['credit'],
};

export const creditDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForCredits },
		options: [
			{
				name: 'Get Balance',
				value: 'get',
				action: 'Get the credit balance',
				description: 'Get the current workspace credit balance',
				routing: {
					request: {
						method: 'GET',
						url: '/credits',
					},
				},
			},
		],
		default: 'get',
	},
];

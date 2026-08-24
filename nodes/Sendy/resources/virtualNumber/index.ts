import type { INodeProperties } from 'n8n-workflow';

const showOnlyForVirtualNumber = {
	resource: ['virtualNumber'],
};

export const virtualNumberDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForVirtualNumber },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get the virtual number',
				// The endpoint always answers 200: `active: false` with null fields when the
				// workspace holds no number, so there is no error branch to handle in a workflow.
				description: 'Get the workspace dedicated virtual number and its billing state',
				routing: {
					request: {
						method: 'GET',
						url: '/number',
					},
				},
			},
		],
		default: 'get',
	},
];

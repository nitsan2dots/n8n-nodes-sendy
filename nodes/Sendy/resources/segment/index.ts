import type { INodeProperties } from 'n8n-workflow';
import { sendyRouting } from '../../shared/errors';

const showOnlyForSegments = {
	resource: ['segment'],
};

export const segmentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSegments },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many segments',
				description: 'List the workspace active segments with their member counts',
				routing: sendyRouting(
					{ method: 'GET', url: '/segments' },
					[{ type: 'rootProperty', properties: { property: 'segments' } }],
				),
			},
		],
		default: 'getAll',
	},
];

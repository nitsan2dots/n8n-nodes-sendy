import type { INodeProperties } from 'n8n-workflow';
import { messageSendDescription } from './send';
import { messageGetDescription } from './get';

const showOnlyForMessages = {
	resource: ['message'],
};

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForMessages },
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send an SMS',
				description: 'Send a single SMS message',
				routing: {
					request: {
						method: 'POST',
						url: '/messages',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a message',
				description: 'Get the status of a sent message',
				routing: {
					request: {
						method: 'GET',
						url: '=/messages/{{$parameter.messageId}}',
					},
				},
			},
		],
		default: 'send',
	},
	...messageSendDescription,
	...messageGetDescription,
];

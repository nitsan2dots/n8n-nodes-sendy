import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMessageGet = {
	operation: ['get'],
	resource: ['message'],
};

export const messageGetDescription: INodeProperties[] = [
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. cmr...',
		displayOptions: { show: showOnlyForMessageGet },
		description: 'The ID returned when the message was sent',
	},
];

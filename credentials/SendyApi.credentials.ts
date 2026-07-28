import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SendyApi implements ICredentialType {
	name = 'sendyApi';

	displayName = 'Sendy API';

	icon: Icon = { light: 'file:../icons/sendy.svg', dark: 'file:../icons/sendy.dark.svg' };

	documentationUrl = 'https://sendy.co.il/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Sendy API key (starts with sk_live_). Create one under Developers in Sendy.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://sendy.co.il/api/v1',
			required: true,
			description:
				'The Sendy API base URL. Leave as-is for production; change it to point at a staging or self-hosted instance.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl}}',
			url: '/credits',
			method: 'GET',
		},
	};
}

import type { INodeProperties } from 'n8n-workflow';
import { contactCreateOrUpdateDescription } from './createOrUpdate';
import { contactGetDescription } from './get';
import { contactGetManyDescription } from './getAll';

const showOnlyForContacts = {
	resource: ['contact'],
};

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForContacts },
		options: [
			{
				name: 'Create or Update',
				value: 'createOrUpdate',
				action: 'Create or update a contact',
				description: 'Create a contact, or update it if the phone number already exists',
				routing: {
					request: {
						method: 'POST',
						url: '/contacts',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a contact',
				description: 'Get a single contact by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/contacts/{{$parameter.contactId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many contacts',
				description: 'Get many contacts, or look one up by phone',
				routing: {
					request: {
						method: 'GET',
						url: '/contacts',
					},
				},
			},
		],
		default: 'createOrUpdate',
	},
	...contactCreateOrUpdateDescription,
	...contactGetDescription,
	...contactGetManyDescription,
];

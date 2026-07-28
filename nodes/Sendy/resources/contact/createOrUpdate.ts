import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactUpsert = {
	operation: ['createOrUpdate'],
	resource: ['contact'],
};

export const contactCreateOrUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 972501234567',
		displayOptions: { show: showOnlyForContactUpsert },
		description: 'The contact phone number — the natural key this upsert matches on',
		routing: {
			send: { type: 'body', property: 'phone' },
		},
	},
	{
		displayName: 'Segment Names or IDs',
		name: 'segments',
		type: 'multiOptions',
		typeOptions: { loadOptionsMethod: 'getSegments' },
		default: [],
		displayOptions: { show: showOnlyForContactUpsert },
		description:
			'Segments to add the contact to. Required (at least one) when creating a new contact; on an existing contact segments are only added, never removed. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: {
			send: { type: 'body', property: 'segments' },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForContactUpsert },
		description: 'On an existing contact, only the fields you set here are updated — blank or omitted fields keep their current value',
		options: [
			{
				displayName: 'Birthday',
				name: 'birthday',
				type: 'string',
				default: '',
				placeholder: 'yyyy-mm-dd',
				description: 'Date of birth in yyyy-mm-dd format. Any other format is ignored.',
				routing: { send: { type: 'body', property: 'birthday' } },
			},
			{
				displayName: 'Custom Field 1',
				name: 'custom_field_1',
				type: 'string',
				default: '',
				description: 'Value for custom field slot 1 (discover its label via Get Many Custom Fields)',
				routing: { send: { type: 'body', property: 'custom_field_1' } },
			},
			{
				displayName: 'Custom Field 2',
				name: 'custom_field_2',
				type: 'string',
				default: '',
				description: 'Value for custom field slot 2 (discover its label via Get Many Custom Fields)',
				routing: { send: { type: 'body', property: 'custom_field_2' } },
			},
			{
				displayName: 'Custom Field 3',
				name: 'custom_field_3',
				type: 'string',
				default: '',
				description: 'Value for custom field slot 3 (discover its label via Get Many Custom Fields)',
				routing: { send: { type: 'body', property: 'custom_field_3' } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The contact email address',
				routing: { send: { type: 'body', property: 'email' } },
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'The contact first name (max 20 characters)',
				routing: { send: { type: 'body', property: 'first_name' } },
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'The contact last name (max 20 characters)',
				routing: { send: { type: 'body', property: 'last_name' } },
			},
		],
	},
];

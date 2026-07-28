import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

/**
 * Authenticated request against the Sendy public API, used by the `loadOptions` dropdowns (the
 * declarative resource operations route their own requests). The base URL comes from the
 * credential so a user can point the node at staging / a self-hosted instance without editing code.
 */
export async function sendyApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('sendyApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${baseUrl}${resource}`,
		json: true,
	};

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'sendyApi',
		options,
	)) as IDataObject;
}

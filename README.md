# n8n-nodes-sendy

This is an n8n community node. It lets you use [Sendy](https://sendy.co.il) in your n8n workflows.

Sendy is a credit-based SMS marketing platform for the Israeli market — send SMS and manage contacts, segments and senders from your automations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes → Install** and enter `n8n-nodes-sendy`.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| **Message** | Send | Send a single SMS (optional idempotency key and send mode) |
| | Get | Get the status of a sent message |
| **Contact** | Create or Update | Idempotent upsert by phone (merges fields, never removes segments, never re-subscribes) |
| | Get | Get one contact by ID |
| | Get Many | List contacts (paginated) or look one up by phone |
| **Segment** | Get Many | List active segments and their member counts |
| **Sender** | Get Many | List approved sender IDs usable as *From* |
| **Custom Field** | Get Many | List the workspace's custom-field slots and labels |
| **Credit** | Get Balance | Get the current credit balance |

## Credentials

You need a Sendy account and an API key.

1. In Sendy, open **Developers** and create an API key (it starts with `sk_live_`).
2. In n8n, create a **Sendy API** credential and paste the key.
3. Leave **Base URL** as `https://sendy.co.il/api/v1` for production (change it only to point at a staging or self-hosted instance).

The credential is validated against `GET /credits` when you save it.

## Compatibility

Requires n8n 1.x. Tested against the Sendy `/api/v1` public API.

## Usage

- **Billing:** 1 credit per message per 201 characters, any encoding. Check the balance with *Credit → Get Balance* before bulk sends.
- **Senders:** only **approved** senders work as *From*. The *From* field is populated from your approved senders.
- **Send mode:** *Marketing* skips recipients unsubscribed in your workspace (no charge for them); *Transactional* declares the message isn't marketing and skips that check. Omit it to use your workspace default.
- **Contacts:** upsert matches on phone. On an existing contact, blank/omitted fields keep their current value and segments are only added. Provide at least one segment when creating a new contact. Israeli phone numbers are normalized automatically.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Sendy](https://sendy.co.il)

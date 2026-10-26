# n8n-nodes-sendy

This is an n8n community node. It lets you use [Sendy](https://sendy.co.il) in your n8n workflows. In the n8n editor it appears as **Sendy SMS**.

Sendy is a credit-based SMS marketing platform for the Israeli market — send SMS, read the replies people send back to your virtual number, and manage contacts, segments and senders from your automations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Example workflows](#example-workflows)  
[Upgrading to 0.4.0](#upgrading-to-040)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings → Community Nodes → Install** and enter `n8n-nodes-sendy`.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| **Message** | Send | Send a single SMS (optional idempotency key and send mode) |
| | Get | Get the status of a sent message |
| **Contact** | Create or Update | Idempotent upsert by phone (merges fields, never removes segments). *Unsubscribe* opts the number out, even if it is not a contact yet; never re-subscribes |
| | Get | Get one contact by ID |
| | Get Many | List contacts (paginated) or look one up by phone |
| **Segment** | Get Many | List active segments and their member counts |
| **Sender** | Get Many | List approved sender IDs usable as *From* |
| **Custom Field** | Get Many | List the workspace's custom-field slots and labels |
| **Credit** | Get Balance | Get the current credit balance |
| **Inbound Message** | Get Many | List SMS replies received on your virtual number (paginated, optional *Received Since*) |
| **Virtual Number** | Get | Get your dedicated virtual number and its billing state |

## Credentials

You need a Sendy account and an API key.

1. In Sendy, open **Developers** and create an API key (it starts with `sk_live_`).
2. In n8n, create a **Sendy SMS API** credential and paste the key.
3. Leave **Base URL** as `https://sendy.co.il/api/v1` for production (change it only to point at a staging or self-hosted instance).

The credential is validated against `GET /credits` when you save it.

## Compatibility

Requires n8n 1.x. Tested against the Sendy `/api/v1` public API.

## Usage

- **Billing:** 1 credit per message per 201 characters, any encoding. Check the balance with *Credit → Get Balance* before bulk sends.
- **Message length:** hard limit **603 characters** (3 credits). A longer body is rejected with `MESSAGE_TOO_LONG` — past that length the SMS gateway silently truncates on the wire, so Sendy refuses instead of charging you for a message that arrives cut short.
- **Senders:** only **approved** senders work as *From*, and the value is matched **literally** — always pick from the dropdown, because a re-typed `0532740000` is rejected as `SENDER_NOT_APPROVED` even when it is your own number. If your workspace holds a Sendy **virtual number** it appears in the list as a `+972…` phone number: send from it and recipients can reply.
- **Send mode:** *Marketing* **rejects** the send (403, nothing charged) when the recipient unsubscribed from your workspace (`RECIPIENT_UNSUBSCRIBED`) or is on its blocked-numbers list (`RECIPIENT_BLOCKED`) — it does not silently skip. *Transactional* declares the message isn't marketing and skips both checks. Omit it to use your workspace default.
- **Other rejections:** `CONTENT_FLAGGED` (422 — the body matched the platform's restricted-content policy, nothing charged) and `ACCOUNT_UNDER_REVIEW` (403 — a new account may only send to its own verified sender number until the review completes).
- **Unsubscribe:** add *Unsubscribe* under *Additional Fields* on *Contact → Create or Update* to sync an opt-out you received elsewhere (CRM, form, phone call). A number that is not a contact yet is created already unsubscribed, and segments are optional for it. The number is also added to the workspace blocklist. Repeating it is safe. Sendy never re-subscribes through the API.
- **Inbound replies:** *Inbound Message → Get Many* returns messages **oldest first** with cursor pagination. `opt_out: "detected"` means Sendy already unsubscribed that sender automatically (`opt_out_applied_at` says when); `"suspected"` is a removal word inside a longer message, flagged in the Sendy app but never auto-applied. To poll for new replies, run it on a **Schedule** trigger with *Received Since* set to your last run. A long inbound message arrives as one item per SMS part — the gateway does not reassemble them.
- **Contacts:** upsert matches on phone. On an existing contact, blank/omitted fields keep their current value and segments are only added. Provide at least one segment when creating a new contact. Israeli phone numbers are normalized automatically.
- **Rate limit:** 60 requests/minute per API key.

## Example workflows

**Send a one-time code from a webhook.** Your app calls an n8n webhook with a phone number and a code.

1. **Webhook** trigger (POST), body `{ "phone": "0501234567", "code": "482913" }`.
2. **Sendy SMS → Message → Send**: *To* `{{ $json.body.phone }}`, *Sender* picked from the dropdown, *Message* `Your verification code is {{ $json.body.code }}`. Under *Additional Fields* set *Mode* to *Transactional* (a code is not marketing, so opt-outs do not block it) and *Idempotency Key* to `otp-{{ $json.body.phone }}-{{ $json.body.code }}`, so a retried webhook never sends or charges twice.
3. **Respond to Webhook** with the returned message ID, if your app wants to check its status later with *Message → Get*.

**Sync an opt-out from your CRM.** When someone opts out of SMS in your CRM, opt them out in Sendy too.

1. Your CRM's trigger node (or a **Webhook** your CRM calls) fires when a contact's SMS consent is removed.
2. **Sendy SMS → Contact → Create or Update**: *Phone* from the CRM record, and under *Additional Fields* add *Unsubscribe* (on). Segments are optional here: a number that is not yet a Sendy contact is created already unsubscribed. Running it twice is safe.

Marketing sends to that number are then rejected with `RECIPIENT_UNSUBSCRIBED`. Opting back in is done in the Sendy app, never through the API.

**Poll inbound replies on a schedule.** Forward the replies to your virtual number to a team channel or a CRM every 15 minutes.

1. **Schedule** trigger, every 15 minutes.
2. **Sendy SMS → Inbound Message → Get Many**: *Return All* on, and under *Filters* set *Received Since* to `{{ $now.minus({ minutes: 15 }).toISO() }}`.
3. Optionally an **If** node on `{{ $json.opt_out }}`: `detected` means Sendy already unsubscribed the sender, so route those separately.
4. Your destination node (Slack, email, CRM note) with the sender's number and the message text.

The window matches the schedule interval, so a reply is seen once. If a run can be skipped, store the last run time in workflow static data and use that instead.

## Upgrading to 0.4.0

0.4.0 renames the node to **Sendy SMS** and its credential to **Sendy SMS API** (credential type `sendySmsApi`, previously `sendyApi`), so they no longer collide with n8n's built-in Sendy email node. This is a **breaking change for existing installs**:

- Existing workflows keep their Sendy SMS nodes (the node type is unchanged), but the nodes lose their credential.
- After updating, create a new **Sendy SMS API** credential with your API key and select it in each Sendy SMS node. The old *Sendy API* credential can then be deleted.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Sendy](https://sendy.co.il)

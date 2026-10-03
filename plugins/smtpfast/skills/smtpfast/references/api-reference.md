# SMTPfast API reference

Base URL: `https://smtpfa.st/api` · Version prefix: `/v1` · Auth: `Authorization: Bearer <API_KEY>` on every request.

All request/response bodies are JSON. IDs are prefixed strings (e.g. `email_abc123`, `contact_...`, `domain_...`). This is a condensed map. The always-current machine-readable spec is at `https://smtpfa.st/api/v1/openapi.json`; fetch it when you need a field this page does not list.

## Emails

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/emails` | Send a single email. |
| POST | `/v1/emails/batch` | Send up to 100 emails (JSON array of email objects). |
| GET | `/v1/emails/{id}` | Get an email's status and delivery events. |
| GET | `/v1/emails` | List sent emails, newest first, without bodies. `limit`, `page`, `status`, `to`, `after`/`before` cursors. |
| PATCH | `/v1/emails/{id}` | Change a scheduled email's `scheduled_at`. To change content, cancel and send again. |
| POST | `/v1/emails/{id}/cancel` | Cancel an email that is still scheduled or queued; `409` once it has left for the provider. |
| POST | `/v1/emails/{id}/share` | Create a link that shows the rendered email to someone without an account. Body `{"expires_in": <seconds>}`, 60 to 2592000. |

**Send email body** (`POST /v1/emails`):

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `from` | string | yes | Sender address on a verified domain. |
| `to` | string[] | yes | Recipient addresses. |
| `subject` | string | yes | |
| `html` | string | no | HTML body. Supports the `{{unsubscribe_url}}` placeholder. |
| `text` | string | no | Plain-text fallback. Same placeholder support. |
| `cc` | string[] | no | |
| `bcc` | string[] | no | |
| `reply_to` | string | no | |
| `headers` | object | no | Custom headers. |
| `tags` | object/array | no | Labels for filtering and analytics. |
| `scheduled_at` | string | no | ISO 8601. Holds the email until then, up to 30 days ahead. Works on `/v1/emails` and `/v1/emails/batch`. |

Send an `Idempotency-Key` header to make a retry safe: the same key returns the first email's id instead of sending twice.

Instead of `html`/`text`, pass `template: { "id": "<id or alias>", "variables": { ... } }` to send a published hosted template (see Templates).

Response: `200` with `{ "id": "..." }`, as Resend returns. `GET /v1/emails/{id}` gives the full email with `last_event` and its events; status flows through `queued → sent → delivered`, with `bounced`, `complained`, `opened`, `clicked` events as applicable.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/emails/metrics` | Aggregate metrics (sent, delivered, opens, clicks, bounces, rates) for a time range. `start_date`, `end_date`, `timezone`, `granularity`, `metrics`, `dimensions` (period, domain, email, broadcast). |
| GET | `/v1/emails/clicked-links` | Which links were clicked, across the account. |

## Templates

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/templates` | List or create templates (`name`, `alias`, `subject`, `from`, `html` or `markdown`, `text`, `variables`). |
| GET/PATCH/DELETE | `/v1/templates/{id}` | Read, edit (the draft) or delete a template. Pass `expected_updated_at` on PATCH to refuse overwriting a newer edit. |
| POST | `/v1/templates/{id}/publish` | Make the draft the version sends use. |
| POST | `/v1/templates/{id}/duplicate` | Copy a template. |

Variables: `{{{KEY}}}`, with a type (`string`, `number`) and optional `fallback_value`, or an inline fallback `{{{KEY|default}}}`. Reading needs `email:read`; writing needs `email:send`.

## Inboxes

Resend-compatible Inboxes API. All paths are under `/v1/inboxes/{inbox_id}`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/inboxes` | List inboxes, or turn an address on a receiving domain into one. |
| GET/PATCH/DELETE | `/v1/inboxes/{inbox_id}` | Manage an inbox. |
| GET | `.../threads` | List threads: `folder`, `label`, `query`, paging. |
| GET/PATCH/DELETE | `.../threads/{thread_id}` | Read, mark read/unread, move folder, label, or delete a thread. |
| GET | `.../threads/{thread_id}/emails` | The messages in a thread (`latest=true` for the newest page first). |
| GET | `.../threads/{thread_id}/emails/{email_id}` | One message with body and `verdicts`. |
| POST | `.../threads/{thread_id}/emails/{email_id}/reply` | Reply in the thread. Needs `email:send`. |
| POST | `.../threads/{thread_id}/emails/{email_id}/forward` | Forward a message. Needs `email:send`. |
| GET/POST | `.../labels`, PATCH/DELETE `.../labels/{label_id}` | Manage labels. |
| GET/POST | `.../drafts`, GET/PATCH/DELETE `.../drafts/{draft_id}` | Drafts for a person to review. |
| POST | `.../drafts/{draft_id}/send` | Send a draft. Pass the reviewed `revision`; a changed draft answers `409`. |

Reading, labelling and drafts need `inbound:read`; deleting needs `inbound:delete`; replying, forwarding and sending drafts also need `email:send`.

## Contacts

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/contacts` | Create or upsert a contact. |
| GET | `/v1/contacts` | List/search contacts (paginated). |
| GET | `/v1/contacts/{id}` | Get a contact. |
| PATCH | `/v1/contacts/{id}` | Update a contact. |
| DELETE | `/v1/contacts/{id}` | Delete a contact. |
| GET | `/v1/contacts/export` | Export contacts. |
| DELETE | `/v1/contacts` | Bulk delete: `{"ids": [...]}` (up to 500), or the whole audience with `{"confirm": "all"}` (owner or admin). |
| GET/POST | `/v1/contact-properties` | List or declare custom fields: `key`, `type` (`string` or `number`), optional `fallback_value`. Undeclared properties still work. |
| GET/PATCH/DELETE | `/v1/contact-properties/{id}` | Read one, change its `fallback_value` (key and type are fixed), or remove the declaration (contact values stay). |

## Segments

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/segments` | List or create segments. |
| GET/PATCH/DELETE | `/v1/segments/{id}` | Manage a segment. |
| GET | `/v1/segments/{id}/contacts` | List a segment's contacts. |
| GET | `/v1/contacts/{id}/segments` | The segments one contact belongs to. |
| POST/DELETE | `/v1/contacts/{id}/segments/{segment_id}` | Add a contact to a segment (already a member is fine) or take it out; the contact stays in the audience. |

## Suppressions

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/suppressions` | List or add suppressed addresses (do-not-send). |
| GET/DELETE | `/v1/suppressions/{id}` | Get or remove a suppression. |
| POST | `/v1/suppressions/batch/add` | Suppress 1 to 100 addresses: `{"emails": [...]}`. |
| POST | `/v1/suppressions/batch/remove` | Remove 1 to 100 suppressions by `emails` or by `ids`, not both. Owner or admin. |

## Broadcasts

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/broadcasts` | List or create broadcasts (campaigns). |
| GET/PATCH/DELETE | `/v1/broadcasts/{id}` | Manage a broadcast. |
| POST | `/v1/broadcasts/{id}/test` | Send a test of the broadcast. |
| POST | `/v1/broadcasts/{id}/send` | Send the broadcast. |
| POST | `/v1/broadcasts/{id}/cancel` | Cancel a scheduled/sending broadcast. |
| GET | `/v1/broadcasts/audience` | How many contacts a broadcast would reach, before you send it. |
| GET | `/v1/broadcasts/{id}/recipients` | Recipients for one event `type` (sent, delivered, opened, clicked, bounced, ...), newest first, with cursors. |
| GET | `/v1/broadcasts/{id}/clicked-links` | Every link clicked in the broadcast, with total and unique clicks. |
| POST | `/v1/broadcasts/{id}/duplicate` | Copy into a new draft (content and targeting, not the schedule or history). Optional `name`. |

## Domains

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/domains` | List or add a sending domain. |
| GET/DELETE | `/v1/domains/{id}` | Get or remove a domain. |
| PATCH | `/v1/domains/{id}` | Turn inbound receiving on or off: `{"receiving_enabled": true}`. |
| POST | `/v1/domains/{id}/verify` | Trigger DNS verification for a domain. |
| GET | `/v1/domains/claim` | The TXT record to publish to claim a domain another team already added. |
| POST | `/v1/domains/claim` | Claim it once the record is live. The domain moves to your team, unverified. |
| POST | `/v1/domains/{id}/domain-connect/cloudflare` | Write the sending records through Cloudflare's Domain Connect screen. |
| POST | `/v1/domains/{id}/domain-connect/cloudflare-inbound` | Same for the inbound MX record. |

A domain must be verified before you can send `from` an address on it. Enabling receiving needs a verified domain, a paid plan and a key created by a team owner or admin; the response carries the MX record to publish and a `receiving.status` of `disabled`, `pending`, `active` or `failed`.

## Inbound (receiving)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/emails/receiving` | List received emails, newest first. `limit` 1 to 100 (default 20), `after` or `before` cursor (a received email id), never both. Metadata only. |
| GET | `/v1/emails/receiving/{id}` | One received email with `html`, `text`, `headers`, attachment metadata and a 15-minute `raw.download_url` for the `.eml`. |
| DELETE | `/v1/emails/receiving/{id}` | Delete your team's copy and its attachments. |
| GET | `/v1/emails/receiving/{id}/attachments` | Attachments with fresh 15-minute `download_url`s. |
| GET | `/v1/emails/receiving/{id}/attachments/{attachment_id}` | One attachment with a download link. |
| POST | `/v1/emails/receiving/{id}/reply` | Reply to a received email, threaded. |
| PATCH | `/v1/emails/receiving/{id}` | Mark one received email read or unread: `{"read": true}`. |
| PATCH | `/v1/emails/receiving` | Mark up to 100 at once: `{"ids": [...], "read": true}`. |

**Reply body**, every field optional:

| Field | Type | Notes |
| --- | --- | --- |
| `from` | string | One of the team's reply addresses for this message. Defaults to the address it was sent to. |
| `to` | string/string[] | Defaults to the sender of the original. |
| `cc` | string/string[] | |
| `subject` | string | Defaults to `Re:` plus the original subject. |
| `text` | string | Plain-text body. The original is quoted underneath. |
| `html` | string | |

The reply carries `In-Reply-To` and `References`, so it lands in the same thread rather than as a new conversation. Needs both `inbound:read` and `email:send`. Honours `Idempotency-Key`: repeat the key on a retry and it sends once, returning the first email's id for 24 hours.

Scopes: `inbound:read` for the reads, `inbound:delete` for the delete. Paths, pagination and object shapes match Resend's receiving API; SMTPfast adds `status` (`delivered` or `quarantined`), `verdicts` (spf, dkim, dmarc, spam, virus), `envelope_from`, `envelope_to`, `domain_id` and `size`. A quarantined message (virus scan did not pass) returns metadata only: no bodies, headers, raw link or attachments. Messages are kept for 30 days. The `email.received` webhook fires once per received email with the list-item metadata; fetch the body by id.

## Webhooks

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/webhooks` | List or create webhook subscriptions. |
| GET/PATCH/DELETE | `/v1/webhooks/{id}` | Manage a webhook. |
| PUT | `/v1/webhooks/{id}` | Same update as PATCH (url, events, active), for clients that use PUT. |
| POST | `/v1/webhooks/{id}/test` | Send a test event to the webhook URL. |
| GET | `/v1/webhooks/{id}/deliveries` | Delivery attempts for a webhook. Filter with `status`, page with `limit` and `after`. |
| GET | `/v1/webhooks/{id}/deliveries/{delivery_id}` | One attempt, with the request and the response we got back. |
| POST | `/v1/webhooks/{id}/deliveries/{delivery_id}/retry` | Send that delivery again. |
| GET | `/v1/webhooks/{id}/events` | Events sent to the webhook (Resend-compatible), with `status` filter. |
| GET | `/v1/webhooks/{id}/events/{event_id}` and `.../attempts` | One event with its payload, and every attempt. |
| POST | `/v1/webhooks/{id}/events/{event_id}/replay` | Deliver an event again. |
| POST | `/v1/webhooks/{id}/signing-secret/rotate` | New signing secret, returned once. Owner or admin. |

Webhooks deliver delivery-event notifications (sent, delivered, bounced, complained, opened, clicked, unsubscribed) and `email.received` for inbound mail to your URL. Prefer them over polling.

## Logs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/logs` | Every email event for the team, newest first. |

Filters: `type`, `since`, `until`, `recipient`, `domain`, `domain_id`, `tag`, `email_id`. Page with `limit`, `after` and `before`. Needs the `logs:read` scope, which is not granted by default and has to be asked for when the key is created.

## Forms

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/forms` | List or create signup forms. |
| GET/PATCH/DELETE | `/v1/forms/{id}` | Manage a form. |
| GET | `/v1/forms/{id}/pending` | Signups waiting on double opt-in. The form itself only embeds the 5 most recent. |
| POST | `/v1/forms/{id}/pending/{pending_id}/approve` | Confirm one signup without the email round trip. |
| POST | `/v1/forms/{id}/pending/approve-all` | Confirm all of them. |
| DELETE | `/v1/forms/{id}/pending/{pending_id}` | Drop a pending signup without confirming it. |
| POST | `/v1/forms/{id}/welcome-preview` | Render the welcome email as the worker would, without sending. Optional `subject` and `markdown` override unsaved edits. |

## Scopes

A key created without a `scopes` field gets `email:send`, `email:read`, `domain:read`, `domain:write`, `contact:read`, `contact:write`, `form:read`, `form:write`, `webhook:read` and `webhook:write`. These are never granted unless asked for: `logs:read`, `inbound:read`, `inbound:delete`, `team:read`, `team:manage`, and `apikey:manage` for minting further keys. A call that needs a scope the key lacks returns 403 naming the scope.

## Team

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/team/members` | Members with their roles (`team:read`). |
| PATCH/DELETE | `/v1/team/members/{id}` | Change a role or billing access, or remove a member (`team:manage`, owner or admin). |
| GET/POST | `/v1/team/invites`, DELETE `/v1/team/invites/{id}` | Pending invitations: list, invite, revoke. |

## API keys and analytics

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/api-keys` | List or create API keys. |
| PATCH/DELETE | `/v1/api-keys/{id}` | Rename a key or change its `scopes` (the secret stays the same), or revoke it. There is no GET for one key; list them instead. |
| GET | `/v1/me` | This key's scopes, plan, rate limit and safety checks. Needs no scope: call it first instead of finding scopes through 403s. |
| GET | `/v1/usage` | Usage against the plan limits, in Resend's shape: emails in the last 24 hours and this month, contacts, segments, domains. |
| GET | `/v1/analytics` | Sending and engagement metrics. |

## Errors

| Status | Meaning |
| --- | --- |
| 400 | Bad request (missing/invalid fields, unverified domain). Fix the request. |
| 401 | Missing or invalid API key. |
| 403 | Key lacks permission for the action. |
| 409 | Conflict: an idempotency key reused with other content, or a resource that changed since you read it. |
| 422 | Valid request that cannot be carried out, such as an unpublished template or missing template variables. |
| 429 | Rate limited. Back off and retry with exponential delay. |
| 5xx | Transient server error. Retry with backoff. |

Error responses include a descriptive message; log the body on failure.

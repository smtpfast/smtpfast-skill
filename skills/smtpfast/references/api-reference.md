# SMTPfast API reference

Base URL: `https://smtpfa.st/api` · Version prefix: `/v1` · Auth: `Authorization: Bearer <API_KEY>` on every request.

All request/response bodies are JSON. IDs are prefixed strings (e.g. `email_abc123`, `contact_...`, `domain_...`). This is a condensed map; the live, always-current spec is served by SMTPfast itself.

## Emails

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/emails` | Send a single email. |
| POST | `/v1/emails/batch` | Send up to 100 emails (JSON array of email objects). |
| GET | `/v1/emails/{id}` | Get an email's status and delivery events. |

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

Response: an `Email` object (`id`, `status`, timestamps, recipient info). Status flows through `queued → sent → delivered`, with `bounced`, `complained`, `opened`, `clicked` events as applicable.

## Contacts

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/contacts` | Create or upsert a contact. |
| GET | `/v1/contacts` | List/search contacts (paginated). |
| GET | `/v1/contacts/{id}` | Get a contact. |
| PATCH | `/v1/contacts/{id}` | Update a contact. |
| DELETE | `/v1/contacts/{id}` | Delete a contact. |
| GET | `/v1/contacts/export` | Export contacts. |

## Segments

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/segments` | List or create segments. |
| GET/PATCH/DELETE | `/v1/segments/{id}` | Manage a segment. |
| GET | `/v1/segments/{id}/contacts` | List a segment's contacts. |

## Suppressions

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/suppressions` | List or add suppressed addresses (do-not-send). |
| GET/DELETE | `/v1/suppressions/{id}` | Get or remove a suppression. |

## Broadcasts

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/broadcasts` | List or create broadcasts (campaigns). |
| GET/PATCH/DELETE | `/v1/broadcasts/{id}` | Manage a broadcast. |
| POST | `/v1/broadcasts/{id}/test` | Send a test of the broadcast. |
| POST | `/v1/broadcasts/{id}/send` | Send the broadcast. |
| POST | `/v1/broadcasts/{id}/cancel` | Cancel a scheduled/sending broadcast. |

## Domains

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/domains` | List or add a sending domain. |
| GET/DELETE | `/v1/domains/{id}` | Get or remove a domain. |
| POST | `/v1/domains/{id}/verify` | Trigger DNS verification for a domain. |

A domain must be verified before you can send `from` an address on it.

## Webhooks

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/webhooks` | List or create webhook subscriptions. |
| GET/PATCH/DELETE | `/v1/webhooks/{id}` | Manage a webhook. |
| POST | `/v1/webhooks/{id}/test` | Send a test event to the webhook URL. |

Webhooks deliver delivery-event notifications (sent, delivered, bounced, complained, opened, clicked) to your URL. Prefer them over polling.

## Forms

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/forms` | List or create signup forms. |
| GET/PATCH/DELETE | `/v1/forms/{id}` | Manage a form. |

## API keys and analytics

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/v1/api-keys` | List or create API keys. |
| GET/DELETE | `/v1/api-keys/{id}` | Get or revoke a key. |
| GET | `/v1/analytics` | Sending and engagement metrics. |

## Errors

| Status | Meaning |
| --- | --- |
| 400 | Bad request (missing/invalid fields, unverified domain). Fix the request. |
| 401 | Missing or invalid API key. |
| 403 | Key lacks permission for the action. |
| 429 | Rate limited. Back off and retry with exponential delay. |
| 5xx | Transient server error. Retry with backoff. |

Error responses include a descriptive message; log the body on failure.

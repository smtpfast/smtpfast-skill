# SMTPfast endpoint index

Every operation in the SMTPfast API, generated from the live OpenAPI spec (`https://smtpfa.st/api/v1/openapi.json`) by `scripts/sync-endpoints.mjs`. Do not edit by hand.

Base URL `https://smtpfa.st/api`, auth `Authorization: Bearer <API_KEY>`. For fields, examples and gotchas, read `api-reference.md`; for anything it does not cover, fetch the spec.

137 operations.

## Logs

The event log behind the Logs page

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/logs` | List email events |

## Emails

Send and track transactional emails

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/emails` | List sent emails |
| POST | `/v1/emails` | Send an email |
| POST | `/v1/emails/batch` | Send a batch of emails |
| GET | `/v1/emails/{id}` | Get email details |
| PATCH | `/v1/emails/{id}` | Reschedule a scheduled email |
| POST | `/v1/emails/{id}/cancel` | Cancel a scheduled email |
| POST | `/v1/emails/{id}/share` | Create a share link for a sent email |
| GET | `/v1/emails/metrics` | Retrieve email metrics |
| GET | `/v1/emails/clicked-links` | List clicked links |

## Receiving

Inbound email: received messages and attachments

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/emails/receiving` | List received emails |
| PATCH | `/v1/emails/receiving` | Mark received emails read or unread |
| GET | `/v1/emails/receiving/{id}` | Get a received email |
| PATCH | `/v1/emails/receiving/{id}` | Mark a received email read or unread |
| DELETE | `/v1/emails/receiving/{id}` | Delete a received email |
| POST | `/v1/emails/receiving/{id}/reply` | Reply to a received email |
| GET | `/v1/emails/receiving/{id}/attachments` | List attachments of a received email |
| GET | `/v1/emails/receiving/{id}/attachments/{attachment_id}` | Get one attachment of a received email |

## Inboxes

Addresses on your own domains organised as mailboxes: threads, labels, folders and drafts

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/inboxes` | List inboxes |
| POST | `/v1/inboxes` | Create an inbox |
| GET | `/v1/inboxes/{inbox_id}` | Retrieve an inbox |
| PATCH | `/v1/inboxes/{inbox_id}` | Update an inbox |
| DELETE | `/v1/inboxes/{inbox_id}` | Delete an inbox |
| GET | `/v1/inboxes/{inbox_id}/threads` | List threads |
| GET | `/v1/inboxes/{inbox_id}/threads/{thread_id}` | Retrieve a thread |
| PATCH | `/v1/inboxes/{inbox_id}/threads/{thread_id}` | Update a thread |
| DELETE | `/v1/inboxes/{inbox_id}/threads/{thread_id}` | Delete a thread |
| GET | `/v1/inboxes/{inbox_id}/threads/{thread_id}/emails` | List thread emails |
| GET | `/v1/inboxes/{inbox_id}/threads/{thread_id}/emails/{email_id}` | Retrieve a thread email |
| POST | `/v1/inboxes/{inbox_id}/threads/{thread_id}/emails/{email_id}/reply` | Reply to a thread email |
| POST | `/v1/inboxes/{inbox_id}/threads/{thread_id}/emails/{email_id}/forward` | Forward a thread email |
| GET | `/v1/inboxes/{inbox_id}/labels` | List labels |
| POST | `/v1/inboxes/{inbox_id}/labels` | Create a label |
| GET | `/v1/inboxes/{inbox_id}/labels/{label_id}` | Retrieve a label |
| PATCH | `/v1/inboxes/{inbox_id}/labels/{label_id}` | Update a label |
| DELETE | `/v1/inboxes/{inbox_id}/labels/{label_id}` | Delete a label |
| GET | `/v1/inboxes/{inbox_id}/drafts` | List drafts |
| POST | `/v1/inboxes/{inbox_id}/drafts` | Create a draft |
| GET | `/v1/inboxes/{inbox_id}/drafts/{draft_id}` | Retrieve a draft |
| PATCH | `/v1/inboxes/{inbox_id}/drafts/{draft_id}` | Update a draft |
| DELETE | `/v1/inboxes/{inbox_id}/drafts/{draft_id}` | Delete a draft |
| POST | `/v1/inboxes/{inbox_id}/drafts/{draft_id}/send` | Send a draft |

## Contacts

Manage subscribers, subscription status, and custom properties

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/contact-properties` | List contact properties |
| POST | `/v1/contact-properties` | Declare a contact property |
| GET | `/v1/contact-properties/{id}` | Get a contact property |
| PATCH | `/v1/contact-properties/{id}` | Update a contact property default |
| DELETE | `/v1/contact-properties/{id}` | Delete a contact property |
| GET | `/v1/contacts` | List contacts |
| POST | `/v1/contacts` | Create a contact |
| DELETE | `/v1/contacts` | Delete contacts in bulk |
| GET | `/v1/contacts/export` | Export contacts |
| GET | `/v1/segments` | List segments |
| POST | `/v1/segments` | Create a segment |
| GET | `/v1/segments/{id}` | Retrieve a segment |
| PATCH | `/v1/segments/{id}` | Update a segment |
| DELETE | `/v1/segments/{id}` | Delete a segment |
| GET | `/v1/segments/{id}/contacts` | List contacts in a segment |
| GET | `/v1/contacts/{id}` | Retrieve a contact |
| PATCH | `/v1/contacts/{id}` | Update a contact |
| DELETE | `/v1/contacts/{id}` | Delete a contact |
| GET | `/v1/contacts/{id}/segments` | List a contact's segments |
| POST | `/v1/contacts/{id}/segments/{segment_id}` | Add a contact to a segment |
| DELETE | `/v1/contacts/{id}/segments/{segment_id}` | Remove a contact from a segment |

## Account

The calling key or connection: scopes, team and plan usage

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/me` | What this API key can do |
| GET | `/v1/usage` | Usage against the plan |

## Team

Members and invitations

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/team/members` | List team members |
| PATCH | `/v1/team/members/{id}` | Change a member's role or billing access |
| DELETE | `/v1/team/members/{id}` | Remove a member |
| GET | `/v1/team/invites` | List pending invitations |
| POST | `/v1/team/invites` | Invite someone to the team |
| GET | `/v1/team/invites/{id}` | Retrieve a pending invitation |
| DELETE | `/v1/team/invites/{id}` | Revoke an invitation |

## Suppressions

Addresses SMTPfast will not send to

| Method | Path | Summary |
| --- | --- | --- |
| POST | `/v1/suppressions/batch/add` | Suppress addresses in bulk |
| POST | `/v1/suppressions/batch/remove` | Remove suppressions in bulk |
| GET | `/v1/suppressions` | List suppressions |
| POST | `/v1/suppressions` | Create a manual suppression |
| GET | `/v1/suppressions/{id}` | Retrieve a suppression |
| DELETE | `/v1/suppressions/{id}` | Delete a suppression |

## Broadcasts

Create, test, schedule, cancel, and measure broadcast campaigns

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/broadcasts` | List broadcasts |
| POST | `/v1/broadcasts` | Create a broadcast draft |
| GET | `/v1/broadcasts/{id}` | Get broadcast details |
| PATCH | `/v1/broadcasts/{id}` | Update a draft or scheduled broadcast |
| DELETE | `/v1/broadcasts/{id}` | Delete a draft broadcast |
| GET | `/v1/broadcasts/audience` | Preview a broadcast audience |
| GET | `/v1/broadcasts/{id}/recipients` | List broadcast recipients |
| GET | `/v1/broadcasts/{id}/clicked-links` | List clicked links |
| POST | `/v1/broadcasts/{id}/duplicate` | Duplicate broadcast |
| POST | `/v1/broadcasts/{id}/send` | Send or schedule a broadcast |
| POST | `/v1/broadcasts/{id}/cancel` | Cancel a scheduled broadcast |
| POST | `/v1/broadcasts/{id}/test` | Send a test broadcast email |

## Templates

Reusable emails with variables, Resend-compatible: draft, publish, then send by id or alias

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/templates` | List templates |
| POST | `/v1/templates` | Create a template |
| GET | `/v1/templates/{id}` | Get a template |
| PATCH | `/v1/templates/{id}` | Update a template |
| DELETE | `/v1/templates/{id}` | Delete a template |
| POST | `/v1/templates/{id}/publish` | Publish a template |
| POST | `/v1/templates/{id}/duplicate` | Duplicate a template |

## Domains

Manage and verify sending domains

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/domains` | List domains |
| POST | `/v1/domains` | Add a domain |
| GET | `/v1/domains/{id}` | Get domain details |
| PATCH | `/v1/domains/{id}` | Turn inbound receiving on or off |
| DELETE | `/v1/domains/{id}` | Delete a domain |
| GET | `/v1/domains/claim` | Get the claim record for a domain |
| POST | `/v1/domains/claim` | Claim a domain held by another account |
| POST | `/v1/domains/{id}/verify` | Verify a domain |
| POST | `/v1/domains/{id}/domain-connect/cloudflare` | Set up sending DNS on Cloudflare in one click |
| POST | `/v1/domains/{id}/domain-connect/cloudflare-inbound` | Set up receiving DNS on Cloudflare in one click |

## API Keys

Create, list, and revoke API keys

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/api-keys` | List API keys |
| POST | `/v1/api-keys` | Create API key |
| PATCH | `/v1/api-keys/{id}` | Update API key |
| DELETE | `/v1/api-keys/{id}` | Revoke API key |

## Webhooks

Configure webhook endpoints for delivery events

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/webhooks` | List webhooks |
| POST | `/v1/webhooks` | Create webhook |
| GET | `/v1/webhooks/{id}` | Get webhook |
| PUT | `/v1/webhooks/{id}` | Update webhook |
| PATCH | `/v1/webhooks/{id}` | Update webhook |
| DELETE | `/v1/webhooks/{id}` | Delete webhook |
| POST | `/v1/webhooks/{id}/test` | Test webhook |
| GET | `/v1/webhooks/{id}/deliveries` | List webhook deliveries |
| GET | `/v1/webhooks/{id}/deliveries/{delivery_id}` | Get a webhook delivery |
| POST | `/v1/webhooks/{id}/deliveries/{delivery_id}/retry` | Retry a webhook delivery |
| GET | `/v1/webhooks/{id}/events` | List webhook events |
| GET | `/v1/webhooks/{id}/events/{event_id}` | Retrieve a webhook event |
| GET | `/v1/webhooks/{id}/events/{event_id}/attempts` | List the attempts of a webhook event |
| POST | `/v1/webhooks/{id}/events/{event_id}/replay` | Replay a webhook event |
| POST | `/v1/webhooks/{id}/signing-secret/rotate` | Rotate a webhook signing secret |

## Forms

Hosted signup forms that add contacts

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/forms` | List signup forms |
| POST | `/v1/forms` | Create a signup form |
| POST | `/v1/forms/{id}/welcome-preview` | Preview a form's welcome email |
| GET | `/v1/forms/{id}` | Retrieve a signup form |
| PATCH | `/v1/forms/{id}` | Update a signup form |
| DELETE | `/v1/forms/{id}` | Delete a signup form |
| GET | `/v1/forms/{id}/pending` | List pending signups |
| POST | `/v1/forms/{id}/pending/approve-all` | Approve all pending signups |
| DELETE | `/v1/forms/{id}/pending/{pendingId}` | Remove a pending signup |
| POST | `/v1/forms/{id}/pending/{pendingId}/approve` | Approve a pending signup |

## Analytics

Email sending analytics and metrics

| Method | Path | Summary |
| --- | --- | --- |
| GET | `/v1/analytics` | Get analytics |

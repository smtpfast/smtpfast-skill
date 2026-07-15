---
name: smtpfast
description: Send transactional emails and manage contacts, domains, broadcasts, suppressions, and webhooks through the SMTPfast (smtpfa.st) email API. Use when the user wants to send email via SMTPfast, integrate the smtpfa.st API, wire up transactional email, add SMTPfast to an app or agent, check an email's delivery status, or manage sending domains, contacts, or broadcasts on SMTPfast.
---

# SMTPfast API

Send email and manage sending from [SMTPfast](https://smtpfa.st), a transactional email API. This skill gives you the auth model, the endpoints, and copy-ready request examples so an agent can integrate SMTPfast correctly on the first try.

## When to use this

Trigger on requests like:

- "Send an email with SMTPfast" / "use the smtpfa.st API"
- "Add transactional email to this app" (when SMTPfast is the provider)
- "Check whether that email was delivered"
- "Create a sending domain / contact / broadcast on SMTPfast"
- "Wire up an SMTPfast webhook"

## The essentials

- **Base URL:** `https://smtpfa.st/api`
- **API version:** all endpoints are under `/v1`, so a full URL looks like `https://smtpfa.st/api/v1/emails`.
- **Auth:** a Bearer token on every request. Create an API key in the [SMTPfast dashboard](https://smtpfa.st) and send it as `Authorization: Bearer sf_live_...`. Never hardcode it; read it from an environment variable (`SMTPFAST_API_KEY`).
- **Content type:** `application/json`.
- **Sending domain:** the `from` address must belong to a domain you have verified in SMTPfast. If a send fails with a domain error, verify the domain first (see the Domains endpoints).

## Send an email

The one call you need most. Required fields: `from`, `to` (an array), `subject`. Common optional fields: `html`, `text`, `cc`, `bcc`, `reply_to`, `headers`, `tags`.

```bash
curl -X POST https://smtpfa.st/api/v1/emails \
  -H "Authorization: Bearer $SMTPFAST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@yourapp.com",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "html": "<h1>Hello!</h1><p>Thanks for signing up.</p>"
  }'
```

A successful call returns an `Email` object with an `id` (e.g. `email_abc123`) and a `status`. The email is queued and sent asynchronously, so `status` starts as `queued`; poll the email by id to see it progress to `delivered`.

```javascript
// Node 18+ (built-in fetch)
const res = await fetch("https://smtpfa.st/api/v1/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SMTPFAST_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "hello@yourapp.com",
    to: ["user@example.com"],
    subject: "Welcome!",
    html: "<h1>Hello!</h1>",
  }),
});
if (!res.ok) throw new Error(`SMTPfast ${res.status}: ${await res.text()}`);
const email = await res.json(); // { id: "email_...", status: "queued", ... }
```

More languages (Python, PHP) are in `examples/send-email.md`.

### Unsubscribe links (marketing and bulk mail)

For any non-essential mail, include the placeholder `{{unsubscribe_url}}` anywhere in your `html` (or `text`). SMTPfast substitutes the per-recipient unsubscribe link at send time and automatically sets the RFC 8058 `List-Unsubscribe` header. This keeps you compliant and helps deliverability.

```json
{ "html": "<p>...</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>" }
```

## Send many at once

To send up to 100 emails in one request, POST a JSON array of the same email objects to `/v1/emails/batch`. Validation runs on every item first: one malformed item rejects the whole batch with `400`. Suppressed recipients are dropped per row.

## Check delivery status

```bash
curl https://smtpfa.st/api/v1/emails/email_abc123 \
  -H "Authorization: Bearer $SMTPFAST_API_KEY"
```

Returns the email's current `status` and its delivery events (queued, sent, delivered, bounced, complained, opened, clicked). Prefer webhooks over polling for anything real-time (see below).

## The rest of the API

Full endpoint list with methods and parameters is in `references/api-reference.md`. Load it when the task goes beyond sending. In brief:

- **Contacts** (`/v1/contacts`) — create/list/update contacts, export, and organize them.
- **Segments** (`/v1/segments`) — group contacts for targeting.
- **Suppressions** (`/v1/suppressions`) — manage the do-not-send list (unsubscribes, bounces, complaints).
- **Broadcasts** (`/v1/broadcasts`) — create a campaign, send a test, then send or cancel it.
- **Domains** (`/v1/domains`) — add a sending domain and trigger DNS verification.
- **Webhooks** (`/v1/webhooks`) — subscribe to delivery events; the preferred way to track status.
- **API keys** (`/v1/api-keys`) and **Analytics** (`/v1/analytics`).

## Handling responses and errors

- **2xx:** success. Sends return `200` with the queued `Email` (or batch result).
- **400:** bad request (missing `from`/`to`/`subject`, malformed body, unverified domain). Read the error message; do not retry blindly.
- **401 / 403:** bad or missing API key, or the key lacks permission. Fix the credential.
- **429:** rate limited. Back off and retry with exponential delay.
- **5xx:** transient server error. Retry a few times with backoff.

Always check `res.ok` (or the status code) and surface the response body on failure; the API returns a descriptive error message.

## Good habits

- Keep the API key in an env var, never in code or logs.
- Send a `text` fallback alongside `html` for deliverability.
- Use webhooks, not polling loops, to react to delivery events.
- Include `{{unsubscribe_url}}` on anything that is not strictly transactional.
- On `429`/`5xx`, retry with exponential backoff; on `400`/`401`, fix the request rather than retrying.

---

By [SMTPfast](https://smtpfa.st). See the full interactive API reference and dashboard at [smtpfa.st](https://smtpfa.st). Built with help from [DevOps Daily](https://devops-daily.com).

# Send an email: examples

Every example posts to `https://smtpfa.st/api/v1/emails` with an API key. The code takes the key as an argument: pass it in from your app's secret store, and never hardcode it. The curl example writes it as `sf_your_api_key`.

## curl

```bash
curl -X POST https://smtpfa.st/api/v1/emails \
  -H "Authorization: Bearer sf_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@yourapp.com",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "html": "<h1>Hello!</h1><p>Thanks for joining.</p>",
    "text": "Hello! Thanks for joining."
  }'
```

## Node.js (18+, built-in fetch)

```javascript
async function sendEmail(apiKey) {
  const res = await fetch("https://smtpfa.st/api/v1/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "hello@yourapp.com",
      to: ["user@example.com"],
      subject: "Welcome!",
      html: "<h1>Hello!</h1>",
      text: "Hello!",
    }),
  });

  if (!res.ok) {
    throw new Error(`SMTPfast ${res.status}: ${await res.text()}`);
  }
  return res.json(); // { id: "..." }
}
```

## Python (requests)

```python
import requests

def send_email(api_key: str) -> dict:
    resp = requests.post(
        "https://smtpfa.st/api/v1/emails",
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
        },
        json={
            "from": "hello@yourapp.com",
            "to": ["user@example.com"],
            "subject": "Welcome!",
            "html": "<h1>Hello!</h1>",
            "text": "Hello!",
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()  # {"id": "..."}
```

## PHP (curl)

```php
<?php
// $apiKey comes from your app's secret store.
$ch = curl_init("https://smtpfa.st/api/v1/emails");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "from" => "hello@yourapp.com",
        "to" => ["user@example.com"],
        "subject" => "Welcome!",
        "html" => "<h1>Hello!</h1>",
    ]),
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 400) {
    throw new Exception("SMTPfast $status: $response");
}
$email = json_decode($response, true);
```

## Marketing email with an unsubscribe link

For non-transactional mail, include `{{unsubscribe_url}}` and SMTPfast fills in the per-recipient link and the `List-Unsubscribe` header:

```json
{
  "from": "news@yourapp.com",
  "to": ["subscriber@example.com"],
  "subject": "This week in your dashboard",
  "html": "<h1>Updates</h1><p>...</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"
}
```

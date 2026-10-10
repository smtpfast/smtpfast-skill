# SMTPfast plugin

Teaches Claude to use the [SMTPfast](https://smtpfa.st) email API, and connects the hosted SMTPfast MCP server.

## What it contains

- **Skill `smtpfast`** (`skills/smtpfast/SKILL.md`): how to send transactional email (raw content or hosted templates), receive inbound email, work an inbox with drafts that a person approves, manage contacts, segments, sending domains and suppressions, run broadcasts, and set up webhooks. `references/api-reference.md` explains each endpoint; `references/endpoints.md` lists every operation, generated from the live OpenAPI spec.
- **MCP server `smtpfast`** (`.mcp.json`): the hosted server at `https://smtpfa.st/api/mcp`, over Streamable HTTP. If you already added this server with `claude mcp add`, remove one of the two: they share the name and each needs its own sign-in.

## What it connects to and sends

- The MCP server and the API calls the skill describes go only to `https://smtpfa.st`. Nothing runs on your machine: the plugin has no hooks, scripts or local servers.
- The first time the MCP server is used, your client opens SMTPfast's OAuth page. You sign in, pick a team and approve scopes. Agents can never create API keys or change team members. You can also use an API key instead (see the skill).
- Requests carry what the task needs, such as recipients, subjects and message bodies, to SMTPfast, which sends the email through its own infrastructure. SMTPfast's privacy policy: https://smtpfa.st/privacy.

## Requirements

An SMTPfast account (the free plan includes 3,000 emails a month) and a verified sending domain for sending.

## Support

Docs: https://smtpfa.st/docs/mcp. Issues: https://github.com/smtpfast/smtpfast-skill/issues. License: MIT.

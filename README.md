# SMTPfast Agent Skill

An [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) that teaches Claude (and other skill-aware agents) how to use the [SMTPfast](https://smtpfa.st) email API correctly: sending transactional email, managing contacts and sending domains, running broadcasts, and wiring up webhooks.

Drop it in and your agent knows the base URL, the auth model, the endpoints, and the right request shapes, so it integrates SMTPfast on the first try instead of guessing.

## What it covers

- **Send email** (single and batch) with copy-ready curl, Node, Python, and PHP examples
- **Auth** (Bearer API key) and the verified-domain requirement
- **Unsubscribe** handling (`{{unsubscribe_url}}` + RFC 8058 `List-Unsubscribe`)
- **Delivery status** via `GET /v1/emails/{id}` and webhooks
- **Contacts, segments, suppressions, broadcasts, domains, webhooks, API keys, analytics** (full endpoint map in the reference)
- **Error handling** and retry guidance (400 vs 429 vs 5xx)

## Install

Skills live in a directory with a `SKILL.md` file; the agent loads it automatically when a request matches.

**For your user** (available everywhere):

```bash
mkdir -p ~/.claude/skills
cp -r skills/smtpfast ~/.claude/skills/
```

**Per project** (checked in for your team):

```bash
mkdir -p .claude/skills
cp -r skills/smtpfast .claude/skills/
```

Set your key once:

```bash
export SMTPFAST_API_KEY="sf_live_..."   # create one at https://smtpfa.st
```

Then just ask, for example: *"send a welcome email to user@example.com with SMTPfast."* The agent picks up the skill on its own. See the [Agent Skills docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) for other agents and the plugin mechanism.

## Layout

```
skills/smtpfast/
  SKILL.md                     # the skill: essentials + send-email quickstart
  references/api-reference.md  # full endpoint map, fields, error codes
  examples/send-email.md       # curl / Node / Python / PHP
```

## Links

- SMTPfast: https://smtpfa.st (dashboard, docs, and the live API reference)
- Built with help from [DevOps Daily](https://devops-daily.com)

## License

[MIT](LICENSE) © SMTPfast

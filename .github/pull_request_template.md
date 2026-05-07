## What changed

<!-- One-line summary. Mention the user-facing impact, not the implementation detail. -->

## Why

<!-- Link to issue, audit item, or short rationale. -->

## How to test

<!-- Step-by-step manual test on the Vercel preview URL.
     If you couldn't test (e.g. requires admin secret, prod data), say so explicitly. -->

- [ ]
- [ ]

## Risk

<!-- Pick one and delete the rest -->

- [ ] **Low** — UI / docs / tests / non-functional
- [ ] **Medium** — backend logic, no schema or auth change
- [ ] **High** — auth, payments, secrets, schema, contracts

## Pre-merge checklist

- [ ] CI is green (typecheck + lint + build)
- [ ] Tested on the Vercel preview URL
- [ ] No secrets in diff (`.env`, private keys, tokens)
- [ ] No `console.log` debugging left in production code paths
- [ ] If schema/Redis-key change: migration plan documented in this PR or an issue
- [ ] If touching `app/api/**` or `lib/**`: explained in **How to test** above

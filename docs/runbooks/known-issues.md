# Known Issues

Things that are broken or imperfect today, with the workaround and a link
to where the real fix should live. Update or remove entries when fixed.

## `npm run build` fails locally with `localStorage.getItem is not a function`

**Symptom:** Running `npm run build` exits non-zero on `/_not-found` and
`/docs/agents/versioning` prerender. Stack points at wagmi/RainbowKit
storage shim.

**Root cause:** Wagmi's persistent storage is initialized at module
import time. During Next.js static prerender (Node, not browser),
`localStorage` doesn't exist. Should be guarded with a
`typeof window !== 'undefined'` check or moved into a client component
mount effect.

**Workaround:** Vercel's hosted build still succeeds (different env), so
production deploys are not blocked. CI runs `next typegen + tsc` instead
of `next build`.

**Fix:** Sprint 1 backlog. Wrap wagmi/RainbowKit init in client-only
component, or set the offending pages to `dynamic = 'force-dynamic'`.

## `next lint` removed in Next 16

**Symptom:** `npm run lint` errors with `Invalid project directory provided`.

**Root cause:** Next 16 dropped the built-in `lint` subcommand.

**Workaround:** `npm run lint` is a no-op stub. CI does not run lint.

**Fix:** Set up ESLint v9 flat config + `eslint-config-next` as a
follow-up PR.

## `facinet-sdk/` is gitignored but exists locally

This is intentional. The SDK is tracked separately and will likely
move out of this repo. Don't add it to git, don't add it to tsconfig
includes, don't reference it from app code.

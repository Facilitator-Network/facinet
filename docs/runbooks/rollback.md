# Rollback Runbook

When prod is broken, the fastest path to "stop bleeding" is rolling back the
deploy, not pushing a fix. Fix later. Restore service first.

## Roll back the live Vercel deploy (≤ 2 minutes)

1. Open https://vercel.com/dashboard and select the project.
2. Go to **Deployments** tab.
3. Find the last known-good deployment (look for a green checkmark on a
   previous commit, ideally one that ran for a while without incidents).
4. Click the `…` menu on that deployment → **Promote to Production**.
5. Vercel swaps the production alias instantly. Confirm at the production URL.

That's it — production is back. The bad commit is still in `main`, but it's
no longer serving traffic.

## After rollback

1. Open an incident note in `docs/runbooks/incidents/YYYY-MM-DD-short-name.md`
   capturing: what broke, when, who, blast radius, current state.
2. Revert the bad commit on `dev`:
   ```
   git checkout dev
   git revert <bad-commit-sha>
   git push origin dev
   ```
3. Open a PR from `dev` → `main` with the revert. Get CI green.
4. Merge. Vercel re-deploys from `main`, confirming the rollback at the
   git level too.

## When *not* to roll back

- The bad change is data-only (e.g. corrupt Redis state). Rolling back the code
  doesn't fix the data. Restore from Upstash backup or write a fix-up script.
- The change is irreversible (schema migration, on-chain transaction). Roll
  forward with a fix instead.

## Who can do this

Anyone with Vercel project access. No on-call rotation yet — until we have
one, the project owner is on-call by default.

## Related

- Vercel deploy history: https://vercel.com/dashboard
- Upstash dashboard (Redis backups): https://console.upstash.com

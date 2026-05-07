# GitHub Repo Setup Checklist

These settings cannot be configured from code — they live in the GitHub
UI under **Settings**. Do these once after merging the CI workflow.

Repo: https://github.com/Facilitator-Network/facinet

## 1. Branch protection — `main`

**Settings → Branches → Add rule** (or **Add classic branch protection rule**)

- Branch name pattern: `main`
- ☑ Require a pull request before merging
  - ☑ Require approvals: **1**
  - ☑ Dismiss stale approvals when new commits are pushed
- ☐ **Require status checks to pass before merging** — leave OFF for the first
  week (report-only mode). Flip ON after we confirm CI is stable.
  - When you flip it on, select: `verify` (the job name from `.github/workflows/ci.yml`)
- ☑ Require conversation resolution before merging
- ☑ Require linear history (optional, but keeps `git log` clean)
- ☐ Allow force pushes — keep OFF
- ☐ Allow deletions — keep OFF

## 2. Branch protection — `dev`

Same as `main` but looser:

- Branch name pattern: `dev`
- ☐ Require pull request — leave OFF for now (you'll push directly during
  early work). Turn ON once the team grows past 1 person.
- ☐ Allow force pushes — keep OFF
- ☐ Allow deletions — keep OFF

## 3. Secret scanning + push protection

**Settings → Code security and analysis**

- ☑ Secret scanning → **Enable**
- ☑ Push protection → **Enable**

This blocks commits that contain detected secrets (private keys, API keys,
tokens) at `git push` time. Free for public repos; on private repos it
needs GitHub Advanced Security.

## 4. Dependabot

Already configured via `.github/dependabot.yml`. Confirm it's running:

**Settings → Code security and analysis**

- ☑ Dependabot alerts → **Enable**
- ☑ Dependabot security updates → **Enable**
- Insights → Dependency graph → **Dependabot** tab should show the
  schedule entries (npm + github-actions, weekly Mondays).

## 5. Vercel ↔ GitHub integration

**Vercel project → Settings → Git**

- Production Branch: `main`
- ☑ Automatically deploy commits pushed to the production branch
- Preview deployments: enabled for all branches (default)
- Ignored Build Step: leave default

CI is **report-only** for the first week — Vercel will deploy regardless of
whether the GitHub Actions check is green or red. After CI proves stable:

**Vercel project → Settings → Git → Connected Git Repository**

- Toggle **"Wait for CI to pass before deploying"** to ON
- Vercel will then block deploys until the `verify` GitHub Actions job
  is green.

## 6. (Later) CODEOWNERS enforcement

`.github/CODEOWNERS` is in place. To make it actually require reviews
from listed owners:

**Settings → Branches → main rule → Edit**

- ☑ Require review from Code Owners

Skip until you have collaborators — pointless on a solo repo.

## 7. Actions permissions

**Settings → Actions → General**

- Workflow permissions: **Read repository contents and packages permissions**
  (default — don't grant write unless a workflow needs it)
- ☑ Allow GitHub Actions to create and approve pull requests
  (needed for Dependabot to open PRs)

---

## Verification

After completing the above, push any commit to `dev`:

1. The `CI` workflow should show up in the **Actions** tab and run.
2. On the next Monday 09:00 UTC, Dependabot should open PRs for any
   pending updates (or post nothing if all deps are current).
3. Trying to push a `.env.local` containing a real key should be
   blocked by push protection.

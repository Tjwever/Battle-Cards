# PR Workflow Guide

This guide covers the automated pull request workflow powered by Kiro hooks and GitHub Actions CI.

## Prerequisites

- **Kiro IDE** — [kiro.dev/downloads](https://kiro.dev/downloads)
- **GitHub CLI (`gh`)** — [cli.github.com](https://cli.github.com)
- Authenticated with GitHub: `gh auth login`

## How It Works

We use a hybrid approach: **local Kiro hooks** catch issues before code leaves your machine, and **GitHub Actions CI** provides a second layer of verification on every PR.

### The Flow

```
1. Make changes in Kiro IDE
   ↓
2. Click "Submit PR" hook (Agent Hooks panel)
   → Scans for hardcoded secrets/tokens
   → Runs linter (auto-detected from project config)
   → Runs type-checker (if TypeScript project)
   → Runs test suite (auto-detected from project config)
   → If issues found, fixes them and re-runs
   → Generates commit message + PR title based on project's convention
   → Presents message for your approval
   → Once approved: commits, pushes, creates PR
   ↓
3. GitHub Actions CI triggers on the PR
   → Lint + Type-check + Tests (hard gate — blocks merge if failing)
   → AI Code Review (posts inline comments — coming soon)
   ↓
4. Review feedback appears on the PR
   ↓
5. Click "Address PR Feedback" hook
   → Fetches all review comments (top-level + inline)
   → Summarizes what was flagged, grouped by file
   → Proposes concrete fixes for each item
   → YOU approve/reject before any changes are applied
   → Pushes approved fixes
   ↓
6. CI re-runs → passes
   ↓
7. Human approves and merges
```

## Available Hooks

Find these in the **Agent Hooks** panel in Kiro's explorer sidebar.

### Automatic Hooks (run without manual trigger)

| Hook | Trigger | What it does |
|------|---------|--------------|
| **Type Check on Save** | File saved (`.ts`/`.tsx`) | Runs TypeScript compiler check |
| **Run Tests After Task** | Spec task completed | Runs the full test suite |
| **Redux Convention Check** | Before any file write | Reminds agent to follow Redux patterns when writing to `src/features/` |

### Manual Hooks (click to trigger)

| Hook | What it does |
|------|--------------|
| **Submit PR** | Full pre-flight checks → commit → push → create PR |
| **Address PR Feedback** | Fetch PR comments → present fixes → wait for approval → push |

## Submit PR — Detailed Behavior

When you click "Submit PR", the agent:

1. **Scans for secrets** — looks for API keys (`sk-`, `ghp_`, `AKIA`), tokens, passwords, private keys, connection strings in changed files. Blocks and flags if found.

2. **Runs the linter** — reads `package.json` to find the lint script. Skips if none configured.

3. **Runs type-check** — checks for `tsconfig.json` and runs the TypeScript compiler. Skips if not a TS project.

4. **Runs tests** — finds the test script in `package.json` and runs it in single-run mode. Skips if none configured.

5. **Generates commit message** — reads `git log --oneline -10` to detect your commit convention (conventional commits, prefixed, etc.) and writes a message matching that style.

6. **Asks for approval** — shows you the commit message and PR title. You can edit or approve.

7. **Creates the PR** — stages files (excluding `.env`/secrets), commits, pushes, and runs `gh pr create`.

## Address PR Feedback — Detailed Behavior

When you click "Address PR Feedback", the agent:

1. **Fetches comments** — pulls review comments, inline code comments, and review decisions from the open PR on your current branch.

2. **Summarizes feedback** — groups by file, explains what each reviewer wants.

3. **Proposes fixes** — shows concrete code changes for each item.

4. **Waits for your approval** — you see everything before any file is touched.

5. **Applies and verifies** — makes approved changes, runs lint/type-check/tests to confirm nothing broke.

6. **Pushes** — commits with `fix: address PR review feedback` and pushes.

## AI Code Review (CI) — Setup for Admins

The AI review step in GitHub Actions requires an API key. It's currently commented out in `.github/workflows/ci.yml`.

### Option A: Kiro CLI (Recommended for company use)

1. Generate a Kiro API key: [app.kiro.dev](https://app.kiro.dev) → Settings → API Keys
2. Add GitHub secret: Repo → Settings → Secrets → Actions → `KIRO_API_KEY`
3. Uncomment the `ai-review` job (Option A) in `ci.yml`

### Option B: Anthropic Claude

1. Generate an API key: [console.anthropic.com](https://console.anthropic.com)
2. Add GitHub secret: Repo → Settings → Secrets → Actions → `ANTHROPIC_API_KEY`
3. Uncomment the `ai-review` job (Option B) in `ci.yml`

## Troubleshooting

### Hooks not appearing in Kiro
Check the Agent Hooks panel in the explorer sidebar. Ensure `.kiro/hooks/` directory exists and files end with `.kiro.hook`.

### `gh` command not found
Install GitHub CLI:
- macOS: `brew install gh`
- Linux: see [cli.github.com](https://cli.github.com)
- Windows: `winget install GitHub.cli`

### "Submit PR" fails to create PR
- Verify `gh auth status` shows you're logged in
- Ensure you're on a feature branch (not `master`)
- Check that you have push access to the remote

### "Address PR Feedback" shows no comments
- Ensure there's an open PR for your current branch
- Run `gh pr view` manually to verify the PR exists

# Agent-board build workflow

How we take a board task from spec to merged PR, one task at a time, in dependency order, with a human gate on every PR.

## The loop in one line

`/next-task` → it builds the next buildable task and opens a PR → CI runs → you review + merge → `/next-task` again.

## Per-task pipeline (what `/build-task` does)

1. **Grill** the spec with `/grill-with-docs` — **mandatory**; it surfaces edge cases and the decisions get folded back into the task file.
2. **Maestro** — write `.maestro/tasks/TASK-XXX.yml` for the task's critical path + grilled edge cases.
3. **Build** the task.
4. **Review** against the `react-native-skills` and `supabase-postgres-best-practices` skills.
5. **Test** — `npm run typecheck` + a green **local** `maestro test` (**mandatory** — the pipeline halts without it).
6. **Pass criteria** — tick what's truly verified; mark fixture-dependent states `manual`.
7. **PR** — branch `task/TASK-XXX` → `dev`, then stop.

## Two trigger options

- **Interactive:** type `/next-task` yourself after each merge. Fully supervised.
- **Scheduled routine:** a cron'd cloud agent runs `/next-task` on a cadence (e.g. each morning), builds + opens the PR unattended, then stops at the PR. CI runs; you still merge by hand.

Merging is always manual — that's the human gate.

## The gates

- **Inside `/build-task` (mandatory):** grilling, then `npm run typecheck` + a green **local** `maestro test` on a booted device. The pipeline halts and won't open a PR without them.
- **On the PR:** `.github/workflows/quality-gates.yml` re-runs `npm run typecheck`, then a human reviews + merges.

There is **no EAS Maestro gate** — testing is the local Maestro run. (Requires Maestro installed: `curl -Ls "https://get.maestro.mobile.dev" | bash`.)

## Commands

```
npm run board        # list tasks, flag which are BUILDABLE
npm run board:next   # JSON for the next buildable task
npm run seed:test    # seed Maestro test users (needs SUPABASE_SERVICE_ROLE_KEY)

node scripts/agent-board.mjs set-status TASK-XXX Done   # syncs board.json + board.md + task header
```

## Rules the driver enforces

- A task is **buildable** only when every `blockedBy` task is `Done`.
- `/build-task` halts if the working tree is dirty — commit first.
- `/next-task` won't start task N+1 while task N's PR is open; it flips merged `task/*` PRs to `Done` to unblock the next one.
- `board.json` is the source of truth; never hand-edit status in three places — use `set-status`.

See `docs/ci-cd/agent-loop.md` for the full reference.

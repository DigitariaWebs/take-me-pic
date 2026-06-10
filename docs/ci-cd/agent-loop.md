# Supervised agent-board build loop

Automates the per-task routine (grill → Maestro → build → review → test → pass-criteria → PR)
across the board in dependency order, with a human gate on every PR.

## Pieces

| Piece | What it is |
| --- | --- |
| `scripts/agent-board.mjs` | Deterministic driver. Reads `.agent-board/board.json`, knows the `blockedBy` DAG. `next` / `list` / `set-status`. |
| `.claude/commands/build-task.md` | `/build-task TASK-XXX` — runs the full pipeline for one task and opens a PR. |
| `.claude/commands/next-task.md` | `/next-task` — one supervised loop step: checks the last PR is settled, then builds the next buildable task. |
| `scripts/seed-test-users.mjs` | Seeds Supabase fixtures (verified / unverified / banned / missing-profile) so Maestro gate states stop being manual. |
| `.eas/workflows/e2e-test-{android,ios}.yml` | Run Maestro on every PR — the objective gate. |

## npm shortcuts

```
npm run board        # list tasks, flag which are BUILDABLE
npm run board:next   # JSON for the next buildable task
npm run seed:test    # seed Maestro test users (needs SUPABASE_SERVICE_ROLE_KEY)
```

## Running the loop

1. `/next-task` — picks the next task whose blockers are all `Done`, runs `/build-task`, opens `task/TASK-XXX` → `dev`.
2. The PR triggers EAS Maestro (iOS + Android). Review the diff + pass criteria.
3. When CI is green and you approve, squash-merge.
4. `/next-task` again. Repeat until `npm run board:next` prints `NONE`.

The loop **never merges itself and never starts task N+1 while task N's PR is open** — that's the "supervised" part.

## Seeding (one-time per environment)

```
SUPABASE_URL=https://oxexcljzzemfenzogcnz.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=*** \
npm run seed:test
```

The service-role key is server-only — never commit it or expose it to the app bundle.
Adjust the `FIXTURES` profile columns in `scripts/seed-test-users.mjs` if the `profiles` schema drifts.

## Notes

- `board.json` is the source of truth for status; `set-status` keeps the `board.md` table in sync.
- Gate states that still need fixtures should be marked `manual` in a task's Pass Criteria, never green-ticked blindly.

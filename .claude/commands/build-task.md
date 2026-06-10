---
description: Run the full agent-board pipeline for one task — grill, write Maestro flow, build, review, test, update pass criteria, open PR.
argument-hint: TASK-XXX
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Skill
---

You are running the **single-task build pipeline** for `$ARGUMENTS` (a board task id like `TASK-005`).

Work the steps in order. **Stop and report** if any step fails or a precondition is not met — do not skip ahead, and do not green-tick a criterion you did not actually verify.

## 0. Preconditions

1. Run `node scripts/agent-board.mjs list` and confirm `$ARGUMENTS` is marked `BUILDABLE` (all `blockedBy` tasks are `Done`). If it is not buildable, stop and say which blocker is open.
2. Ensure the working tree is clean (`git status`). If dirty, stop and ask.
3. Create/switch to branch `task/$ARGUMENTS` off the latest `dev` (`git fetch`, then branch from `origin/dev`).
4. Move the task into progress: `node scripts/agent-board.mjs set-status $ARGUMENTS "In Progress"`.

## 1. Grill the spec

Read `.agent-board/tasks/$ARGUMENTS.md`, then run `/grill-with-docs` against it to sharpen scope, acceptance criteria, and edge cases. Fold any clarifications back into the task file.

## 2. Author the Maestro flow

Write or update `.maestro/tasks/$ARGUMENTS.yml` covering this task's critical path (keep it focused — auth/onboarding/core nav, not a broad UI tour). Then register the flow in **both** EAS workflows if missing:
- `.eas/workflows/e2e-test-android.yml`
- `.eas/workflows/e2e-test-ios.yml`

States that need seeded Supabase users (unverified / banned / missing-profile) should use `scripts/seed-test-users.mjs` (see its README note). If a state still cannot be automated, mark its Pass Criteria item `manual` — do **not** tick it green.

## 3. Build the task

Implement the scope in `.agent-board/tasks/$ARGUMENTS.md`. Follow the repo's existing patterns and file structure.

## 4. Convention review

Self-review the diff against the project skills before testing:
- Invoke the **react-native-skills** skill and check the changed RN/Expo code against it.
- Invoke the **supabase-postgres-best-practices** skill and check any SQL / migrations / RLS / query code against it.

Fix what the review surfaces. Summarize findings you deliberately chose not to act on.

## 5. Test

Run, and paste the real output of:
- `npm run typecheck`
- `maestro test .maestro/tasks/$ARGUMENTS.yml`

If either fails, fix and re-run before continuing.

## 6. Update pass criteria

In `.agent-board/tasks/$ARGUMENTS.md`, tick the Acceptance Criteria / Pass Criteria / Verification boxes you genuinely verified. Leave (or annotate `manual`) anything that needs backend fixtures or human review. Then move the task to review: `node scripts/agent-board.mjs set-status $ARGUMENTS "Review"`.

## 7. Open the PR

Commit on `task/$ARGUMENTS` and open a PR into `dev` with `gh pr create`. The PR body must list:
- what was built,
- the typecheck + maestro results,
- which Pass Criteria are green vs. still `manual`,
- a checklist line: "Merges only after EAS Maestro (iOS+Android) is green and a human approves."

The PR triggers `.eas/workflows/e2e-test-{android,ios}.yml` automatically — that EAS Maestro run is the objective gate, not your local run.

## 8. Report back

End with: the PR url, the board transition, and a one-line "next buildable task" from `node scripts/agent-board.mjs next`. **Do not merge** and do not start the next task — the supervised loop waits for CI-green + human approval.

# Daily Shift Tasks

This folder keeps dated Markdown shift logs inside the git tree.

Use one file per day:

```text
docs/daily_shift_tasks/daily-shift-YYYY-MM-DD.md
```

The source PDF template used for the first entry is:

```text
/Users/macbookpro/Downloads/daily_shift_tasks_2026-06-06.pdf
```

## Automation Options

Recommended approach: use the repo script to generate a minimal daily draft from git.

Inputs the script should collect:

- `git branch --show-current`
- `git status --short`
- `git log --since=midnight --oneline`
- big tasks completed during the shift
- verification commands run during the shift, when useful

Command:

```json
{
  "scripts": {
    "shift:daily": "node scripts/daily-shift.mjs"
  }
}
```

The script can write `docs/daily_shift_tasks/daily-shift-YYYY-MM-DD.md`, prefill the git snapshot, and leave task details editable.

Run it with:

```text
npm run shift:daily
```

Generate or update a specific day with:

```text
npm run shift:daily -- --date YYYY-MM-DD
```

The generated git block is wrapped in markers so rerunning the command updates only the automated section and preserves manual notes.

Optional automation layers:

- Git hook: use `post-commit` to append commit hashes to the current daily shift file.
- Scheduled CI: use a daily GitHub Actions workflow to open a PR with the generated log when commits exist.
- Agent routine: run an end-of-day Codex routine that summarizes big tasks done, test output, and next tasks.

Keep these logs committed with the work they describe so each day can be audited through git history.

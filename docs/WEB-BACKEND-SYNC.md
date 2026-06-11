# Web Backend Sync — Shared Supabase Changes Made by the Web/Admin Repo

Date: 2026-06-11
Audience: this mobile repo's agents and devs.
Source: `/Users/macbookpro/Documents/Progix/take-my-pic-web/take-me-pic-web`
(see its `docs/MOBILE-SYNC-NOTES.md` and `docs/adr/` for full rationale).
Status: all changes below are LIVE on the shared Supabase project
`oxexcljzzemfenzogcnz` as recorded migrations.

The web admin console runs live trust-and-safety operations against the same
database this app uses. The web repo changed schema, RLS, and added staff-only
RPCs that affect mobile behavior. Read the section matching your task before
wiring a feature.

**Convention:** whoever changes the shared Supabase schema updates this file
here AND `docs/MOBILE-SYNC-NOTES.md` in the web repo. The database is the only
contract the two repos share.

## 1. Spots now have a review lifecycle — affects TASK-013

`spots` gained columns (web ADR-0006):

```
status       public.spot_status not null default 'pending'
             (pending | approved | rejected)
reviewed_at  timestamptz null
reviewed_by  uuid null references profiles(id)
```

- `spots_read` RLS is now: `status = 'approved' OR created_by = auth.uid() OR
  staff`. **A newly submitted spot is invisible to other users until staff
  approve it** in the web admin.
- Mobile must show the creator a "pending review" state on their own spots —
  the app previously assumed immediate visibility.
- RLS already does the exclusion; do NOT re-filter approved spots client-side,
  but do branch UI on `status` for the creator's own spots.
- Staff approve/reject goes through `admin_review_spot(...)` — never call it
  from mobile.

## 2. Posts and comments can be staff-hidden — affects TASK-012

`posts` and `comments` gained `hidden_at timestamptz` / `hidden_by uuid`
(web ADR-0005). Read RLS is now:
`hidden_at is null OR author_id = auth.uid() OR staff`.

- Hidden content silently disappears from feeds for everyone except the
  author. Authors still see their own hidden content — optionally badge it
  ("masqué par la modération").
- Hiding is the moderation path; content is NOT deleted. Don't treat a
  vanished post as an error.
- Staff hide/restore goes through `admin_set_post_visibility(...)` /
  `admin_set_comment_visibility(...)` — never call them from mobile.
- The staff `DELETE` RLS policies on posts/comments predate this and bypass
  the audit log; the web admin never uses them. This repo should decide
  whether to drop staff from those policies (open item).

## 3. Ratings and karma — affects TASK-008 (paired with web TASK-007-2)

The web repo will build read-only staff inspection of `karma_ledger` and
`ratings` (its TASK-007-2) on top of whatever this task writes. Keep the
semantics coordinated:

- `karma_ledger` (`user_id`, `delta`, `reason`, `help_request_id`,
  `created_at`): RLS is self-read only (`auth.uid() = user_id`); the web side
  will add a staff read policy. Keep `reason` values stable and
  machine-readable (an enum-like string set, documented in this file when
  chosen) — staff fraud investigation will group by them.
- Keep karma writes server-owned (RPC/trigger), not client-computed inserts,
  so the ledger stays trustworthy as an audit trail.
- `ratings` (`help_request_id`, `rater_id`, `ratee_id`, `stars`, `comment`):
  readable by all authenticated users; inserts open. Enforce
  one-rating-per-rater-per-session server-side (unique constraint or RPC),
  not just in UI.
- **Gap:** `ratings.comment` is free text but a rating is NOT a valid report
  target (`reports` points at user/post/comment/session/conversation/message
  only). If rating comments ship user-visible, "report this rating" needs a
  new `reports.rating_id` column — coordinate with the web repo before adding.
- `leaderboard` is a derived read model (rank, karma, profile fields) — read
  it, don't write it.

## 4. Reports have direct target columns — affects TASK-010

`reports` gained `help_request_id`, `conversation_id`, `message_id`
(web ADR-0002), in addition to `reported_user_id`, `post_id`, `comment_id`.

- A report has exactly ONE target column set. When users report a session,
  conversation, or message, set the matching column — don't fall back to
  participant-level reports, which make unrelated history look like session
  risk.
- `reports.status` is enum `public.report_status`
  (`open | reviewing | resolved | dismissed`). Mobile inserts only ever
  create `open`; decisions are staff-only via web RPCs.

## 5. Ban semantics — affects TASK-010 banned-user gates

- **Active ban** = a `bans` row with `expires_at IS NULL` or
  `expires_at > now()`. Unban sets `expires_at = now()` and keeps the row —
  never check ban state by row existence, and don't trust
  `profiles.is_banned` (the web RPCs do not maintain it; open item).
- Account status derives from the active ban: temporary → suspended,
  permanent → banned.

## 6. Session content stays participant-only — affects TASK-007

`conversations`, `messages`, and `session_photos` remain participant-only
(web ADR-0004). Web staff see only metadata summaries through an audited RPC;
no policy broadening happened. Nothing to change on mobile — listed so nobody
"fixes" a staff-access gap that is deliberate.

## 7. Account/profile invariants

- `user_roles`, `reports.reported_user_id`, `bans.user_id`, and the new
  `hidden_by`/`reviewed_by` columns all FK to `public.profiles`, NOT
  `auth.users`. Signup must always create the `profiles` row (there is no DB
  trigger doing it).
- Staff-only RPCs (`admin_*`, `get_session_conversation_summary`) verify
  `private.is_staff()` internally and return SQLSTATE 42501 for non-staff.
  Never call them from mobile; never duplicate their logic client-side.

-- ============================================================================
-- Take Me Pic — initial schema
-- Designed from the PRD modules + the mobile mock data layer (data/mock.ts).
-- Follows the supabase-postgres-best-practices skill:
--   * lowercase snake_case identifiers
--   * bigint identity PKs (single Postgres DB); profiles.id is uuid -> auth.users
--   * PostGIS geography(Point,4326) + GiST for the "nearby in 30s" query
--   * RLS enabled + forced on every table; policies wrap auth.uid() in a SELECT
--   * indexes on every FK and every column used in an RLS policy
--   * check constraints + enums to enforce the request state machine
-- Apply via the Supabase SQL editor or `supabase db push` (needs service role / db pwd).
-- ============================================================================

-- On Supabase, extensions live in the `extensions` schema (already on the role
-- search_path), so PostGIS types/functions resolve unqualified in plain queries.
create extension if not exists postgis with schema extensions;  -- ST_DWithin nearby search
create extension if not exists pg_trgm with schema extensions;   -- username / text search

-- Private schema for SECURITY DEFINER helpers (never exposed via PostgREST).
create schema if not exists private;

-- ----------------------------------------------------------------------------
-- Enums (small, fixed value sets — state machines & kinds)
-- ----------------------------------------------------------------------------
create type presence_status   as enum ('available', 'busy', 'offline');
create type request_status     as enum ('requested', 'accepted', 'in_session', 'completed', 'rated', 'cancelled', 'expired');
create type notification_kind  as enum ('karma', 'request', 'community', 'badge', 'spot', 'system');
create type app_role           as enum ('user', 'moderator', 'admin', 'super_admin');
create type report_status      as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type booking_status     as enum ('pending', 'confirmed', 'cancelled', 'refunded');
create type itinerary_kind     as enum ('photo', 'coffee', 'ticket', 'walk', 'view');
create type store_kind         as enum ('apple', 'google');
create type subscription_status as enum ('active', 'in_grace', 'expired', 'cancelled', 'paused');

-- ============================================================================
-- IDENTITY & TRUST  (PRD module 5)
-- ============================================================================

-- profiles 1:1 with auth.users. id IS auth.users.id (Supabase convention).
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  first_name    text not null,
  last_name     text,
  username      text not null unique,
  age           int  check (age is null or age between 13 and 120),
  city          text,
  languages     text[] not null default '{}',   -- ISO/flag codes, e.g. {fr,en,es}
  avatar_url    text,
  cover_url     text,
  bio           text,
  -- denormalized counters (kept current by triggers / edge fns; cheap to read)
  karma         int  not null default 0,
  rating        numeric(3,2) not null default 0 check (rating between 0 and 5),
  photos_count  int  not null default 0,
  followers     int  not null default 0,
  following     int  not null default 0,
  spots_count   int  not null default 0,
  -- trust signals
  email_verified boolean not null default false,
  phone          text,
  phone_verified boolean not null default false,
  verified       boolean not null default false,  -- email AND phone verified
  is_premium     boolean not null default false,  -- mirror of active subscription
  is_banned      boolean not null default false,
  member_since  date not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);
create index profiles_languages_idx     on public.profiles using gin (languages);

-- RBAC for the admin console (PRD module 10 — replaces the localStorage stub).
create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role    app_role not null,
  granted_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
create index user_roles_user_id_idx on public.user_roles (user_id);

-- ============================================================================
-- PROXIMITY & PRESENCE  (PRD module 1 — the latency-critical 30s path)
-- ============================================================================
-- Separate, high-write table so presence churn never bloats profiles.
create table public.presence (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  status      presence_status not null default 'offline',
  location    geography(point, 4326),       -- session-only GPS (PRD user story 13)
  share_radius_m int not null default 1500,
  updated_at  timestamptz not null default now()
);
-- GiST index powers ST_DWithin(location, $point, $radius) — "available users near me".
create index presence_location_gix on public.presence using gist (location);
create index presence_status_idx   on public.presence (status) where status = 'available';

-- ============================================================================
-- HELP REQUEST & MATCHING  (PRD module 2 — explicit state machine)
-- ============================================================================
create table public.help_requests (
  id            bigint generated always as identity primary key,
  requester_id  uuid not null references public.profiles (id) on delete cascade,
  helper_id     uuid references public.profiles (id) on delete set null,
  status        request_status not null default 'requested',
  location      geography(point, 4326) not null,
  people_count  int not null default 1 check (people_count between 1 and 30),
  note          text,
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz,
  session_at    timestamptz,
  completed_at  timestamptz,
  expires_at    timestamptz not null default now() + interval '10 minutes',
  -- a helper cannot accept their own request
  constraint helper_not_requester check (helper_id is null or helper_id <> requester_id)
);
create index help_requests_requester_idx on public.help_requests (requester_id);
create index help_requests_helper_idx    on public.help_requests (helper_id);
create index help_requests_status_idx    on public.help_requests (status);
create index help_requests_location_gix  on public.help_requests using gist (location);
create index help_requests_open_idx      on public.help_requests (created_at desc)
  where status in ('requested', 'accepted', 'in_session');

-- Enforce the legal transitions of the state machine in the DB, not just the app.
create or replace function private.enforce_request_transition()
returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;
  if not (
    (old.status = 'requested'  and new.status in ('accepted','cancelled','expired')) or
    (old.status = 'accepted'   and new.status in ('in_session','cancelled','expired')) or
    (old.status = 'in_session' and new.status in ('completed','cancelled')) or
    (old.status = 'completed'  and new.status = 'rated')
  ) then
    raise exception 'illegal help_request transition: % -> %', old.status, new.status;
  end if;
  return new;
end $$;
create trigger help_requests_transition
  before update of status on public.help_requests
  for each row execute function private.enforce_request_transition();

-- ============================================================================
-- REALTIME SESSION & CHAT  (PRD module 3)
-- ============================================================================
-- A conversation is usually tied to a help_request, but can also be standalone.
create table public.conversations (
  id              bigint generated always as identity primary key,
  help_request_id bigint references public.help_requests (id) on delete set null,
  created_at      timestamptz not null default now()
);
create index conversations_help_request_idx on public.conversations (help_request_id);

create table public.conversation_participants (
  conversation_id bigint not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);
create index conversation_participants_user_idx on public.conversation_participants (user_id);

create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text,
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_idx       on public.messages (sender_id);

-- Secure in-app photo transfer — bytes live in Supabase Storage, row is the pointer.
create table public.session_photos (
  id              bigint generated always as identity primary key,
  help_request_id bigint not null references public.help_requests (id) on delete cascade,
  uploader_id     uuid not null references public.profiles (id) on delete cascade,
  storage_path    text not null,            -- bucket path, not a public URL
  is_favorite     boolean not null default false,
  created_at      timestamptz not null default now()
);
create index session_photos_request_idx  on public.session_photos (help_request_id);
create index session_photos_uploader_idx on public.session_photos (uploader_id);

-- ============================================================================
-- KARMA & REPUTATION  (PRD module 4 — deterministic ledger)
-- ============================================================================
create table public.ratings (
  id              bigint generated always as identity primary key,
  help_request_id bigint not null references public.help_requests (id) on delete cascade,
  rater_id        uuid not null references public.profiles (id) on delete cascade,
  ratee_id        uuid not null references public.profiles (id) on delete cascade,
  stars           int  not null check (stars between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now(),
  unique (help_request_id, rater_id)        -- one rating per person per session
);
create index ratings_ratee_idx   on public.ratings (ratee_id);
create index ratings_request_idx on public.ratings (help_request_id);

-- Append-only karma ledger; profiles.karma is the cached sum.
create table public.karma_ledger (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  delta           int  not null,
  reason          text not null,            -- 'photo_taken' | 'five_star' | 'penalty' ...
  help_request_id bigint references public.help_requests (id) on delete set null,
  created_at      timestamptz not null default now()
);
create index karma_ledger_user_idx on public.karma_ledger (user_id, created_at desc);

-- TMP Stars leaderboard (PRD user story 17) — derived, never stored.
create or replace view public.leaderboard
with (security_invoker = true) as
  select id as user_id, first_name, last_name, username, avatar_url, karma,
         rank() over (order by karma desc) as rank
  from public.profiles
  where is_banned = false;

-- ============================================================================
-- COMMUNITY FEED & SPOTS  (PRD module 8)
-- ============================================================================
create table public.spots (
  id            bigint generated always as identity primary key,
  name          text not null,
  city          text,
  location      geography(point, 4326),
  rating        numeric(3,2) not null default 0 check (rating between 0 and 5),
  reviews_count int  not null default 0,
  best_time     text,
  hero_url      text,
  created_by    uuid references public.profiles (id) on delete set null,
  is_sponsored  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index spots_location_gix on public.spots using gist (location);
create index spots_created_by_idx on public.spots (created_by);

create table public.spot_photos (
  id           bigint generated always as identity primary key,
  spot_id      bigint not null references public.spots (id) on delete cascade,
  storage_path text not null,
  created_at   timestamptz not null default now()
);
create index spot_photos_spot_idx on public.spot_photos (spot_id);

create table public.spot_tips (
  id         bigint generated always as identity primary key,
  spot_id    bigint not null references public.spots (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index spot_tips_spot_idx on public.spot_tips (spot_id);
create index spot_tips_user_idx on public.spot_tips (user_id);

create table public.posts (
  id            bigint generated always as identity primary key,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  spot_id       bigint references public.spots (id) on delete set null,
  city          text,
  image_url     text not null,
  caption       text,
  badge         text,
  hearts_count  int not null default 0,
  comments_count int not null default 0,
  created_at    timestamptz not null default now()
);
create index posts_author_idx  on public.posts (author_id);
create index posts_created_idx on public.posts (created_at desc);
create index posts_spot_idx    on public.posts (spot_id);

create table public.post_likes (
  post_id    bigint not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index post_likes_user_idx on public.post_likes (user_id);

create table public.comments (
  id           bigint generated always as identity primary key,
  post_id      bigint not null references public.posts (id) on delete cascade,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  body         text not null,
  hearts_count int not null default 0,
  created_at   timestamptz not null default now()
);
create index comments_post_idx   on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint no_self_follow check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows (followee_id);

-- ============================================================================
-- SUBSCRIPTIONS & ENTITLEMENTS  (PRD module 6 — Apple IAP via RevenueCat)
-- ============================================================================
create table public.subscriptions (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references public.profiles (id) on delete cascade,
  store             store_kind not null,
  product_id        text not null,                 -- e.g. tmp_premium_monthly
  status            subscription_status not null,
  revenuecat_id     text,                          -- RevenueCat app_user_id
  entitlements      jsonb not null default '{"ad_free":true,"profile_boost":true,"exclusive_spots":true}',
  current_period_end timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create index subscriptions_entitlements_gin on public.subscriptions using gin (entitlements);

-- ============================================================================
-- PAYMENTS, BOOKINGS & B2B  (PRD module 7 — Stripe / Stripe Connect)
-- ============================================================================
create table public.businesses (
  id          bigint generated always as identity primary key,
  name        text not null,
  contact_email text,
  stripe_customer_id text,
  created_at  timestamptz not null default now()
);

create table public.bookings (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  amount_cents    int not null check (amount_cents >= 0),
  currency        text not null default 'eur',
  commission_cents int not null default 0,
  status          booking_status not null default 'pending',
  stripe_payment_intent text,
  scheduled_for   timestamptz,
  created_at      timestamptz not null default now()
);
create index bookings_user_idx on public.bookings (user_id);

create table public.sponsored_campaigns (
  id           bigint generated always as identity primary key,
  business_id  bigint not null references public.businesses (id) on delete cascade,
  spot_id      bigint references public.spots (id) on delete set null,
  -- geo-targeted ads: target area + radius
  target_area  geography(point, 4326),
  target_radius_m int,
  budget_cents int not null default 0,
  stripe_invoice_id text,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index sponsored_campaigns_business_idx on public.sponsored_campaigns (business_id);
create index sponsored_campaigns_area_gix on public.sponsored_campaigns using gist (target_area);

-- ============================================================================
-- ITINERARIES & AI PHOTOHELPER  (PRD modules 11, ecosystem)
-- ============================================================================
create table public.itineraries (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  city       text,
  day        date,
  created_at timestamptz not null default now()
);
create index itineraries_user_idx on public.itineraries (user_id);

create table public.itinerary_steps (
  id            bigint generated always as identity primary key,
  itinerary_id  bigint not null references public.itineraries (id) on delete cascade,
  position      int not null,
  time_label    text,
  title         text not null,
  subtitle      text,
  kind          itinerary_kind not null default 'photo',
  thumb_url     text,
  price_cents   int,
  active        boolean not null default false
);
create index itinerary_steps_itinerary_idx on public.itinerary_steps (itinerary_id, position);

-- Provider-agnostic log of AI framing suggestions (Claude vision today).
create table public.ai_suggestions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  help_request_id bigint references public.help_requests (id) on delete set null,
  image_path      text,
  provider        text not null default 'anthropic',
  suggestion      jsonb,
  created_at      timestamptz not null default now()
);
create index ai_suggestions_user_idx on public.ai_suggestions (user_id);

-- Static framing-guide content (data/mock.ts manualSecrets / "Manuel illustré").
create table public.framing_tips (
  id        bigint generated always as identity primary key,
  color     text,
  title     text not null,
  body      text,
  thumb_url text,
  big       boolean not null default false,
  position  int not null default 0
);

-- ============================================================================
-- FAMILY MODE  (PRD user story 30 — Phase 3)
-- ============================================================================
create table public.families (
  id         bigint generated always as identity primary key,
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);
create index families_owner_idx on public.families (owner_id);

create table public.family_members (
  family_id        bigint not null references public.families (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  relation         text,                       -- 'mari' | '12 ans' ...
  location_sharing boolean not null default false,
  created_at       timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index family_members_user_idx on public.family_members (user_id);

-- ============================================================================
-- NOTIFICATIONS & PUSH  (PRD module 9 — APNs/FCM via expo-notifications)
-- ============================================================================
create table public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       notification_kind not null,
  body       text not null,
  meta       text,
  emphasis   text,                              -- 'gold' | 'red' | 'normal'
  data       jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

create table public.push_tokens (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  token      text not null unique,
  platform   store_kind not null,
  created_at timestamptz not null default now()
);
create index push_tokens_user_idx on public.push_tokens (user_id);

-- ============================================================================
-- TRUST, SAFETY & MODERATION  (PRD module 5 — P0; cross-cutting)
-- ============================================================================
create table public.reports (
  id               bigint generated always as identity primary key,
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  post_id          bigint references public.posts (id) on delete cascade,
  comment_id       bigint references public.comments (id) on delete cascade,
  reason           text not null,
  status           report_status not null default 'open',
  resolver_id      uuid references public.profiles (id) on delete set null,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index reports_status_idx   on public.reports (status) where status in ('open','reviewing');
create index reports_reported_idx on public.reports (reported_user_id);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

create table public.bans (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  reason      text not null,
  banned_by   uuid references public.profiles (id) on delete set null,
  expires_at  timestamptz,                     -- null = permanent
  appeal_status report_status,
  created_at  timestamptz not null default now()
);
create index bans_user_idx on public.bans (user_id);

-- Server-enforced admin audit log (PRD user story 36).
create table public.admin_audit_log (
  id          bigint generated always as identity primary key,
  admin_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);
create index admin_audit_admin_idx on public.admin_audit_log (admin_id, created_at desc);

-- ============================================================================
-- SECURITY HELPERS  (SECURITY DEFINER, in private schema, identity-checked)
-- ============================================================================
create or replace function private.has_role(check_role app_role)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = check_role
  );
$$;
revoke execute on function private.has_role(app_role) from public, anon, authenticated;

create or replace function private.is_staff()
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid())
      and role in ('moderator','admin','super_admin')
  );
$$;
revoke execute on function private.is_staff() from public, anon, authenticated;

-- Are two users in the same conversation? (used by message RLS)
create or replace function private.in_conversation(conv_id bigint)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and user_id = (select auth.uid())
  );
$$;
revoke execute on function private.in_conversation(bigint) from public, anon, authenticated;

-- ============================================================================
-- PROXIMITY RPC  (PRD module 1 interface: findAvailableHelpers)
-- ============================================================================
-- The single most important query in the product. ST_DWithin uses the GiST
-- index on presence.location; results ordered by true distance (KNN).
create or replace function public.find_available_helpers(
  lng double precision,
  lat double precision,
  radius_m int default 1500
)
returns table (
  user_id uuid, first_name text, avatar_url text, karma int,
  rating numeric, verified boolean, distance_m double precision
)
-- not SECURITY DEFINER (runs as caller); needs `extensions` on the path for PostGIS.
language sql stable set search_path = public, extensions as $$
  select p.id, p.first_name, p.avatar_url, p.karma, p.rating, p.verified,
         st_distance(pr.location, st_makepoint(lng, lat)::geography) as distance_m
  from public.presence pr
  join public.profiles p on p.id = pr.user_id
  where pr.status = 'available'
    and p.is_banned = false
    and p.id <> (select auth.uid())
    and st_dwithin(pr.location, st_makepoint(lng, lat)::geography, radius_m)
  order by pr.location <-> st_makepoint(lng, lat)::geography
  limit 50;
$$;

-- ============================================================================
-- updated_at trigger
-- ============================================================================
create or replace function private.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch     before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function private.touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Enable + force on every table. Policies wrap auth.uid() in a SELECT so it is
-- evaluated once per statement, not once per row (best-practice: 100x faster).
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_roles','presence','help_requests','conversations',
    'conversation_participants','messages','session_photos','ratings','karma_ledger',
    'spots','spot_photos','spot_tips','posts','post_likes','comments','follows',
    'subscriptions','businesses','bookings','sponsored_campaigns','itineraries',
    'itinerary_steps','ai_suggestions','framing_tips','families','family_members',
    'notifications','push_tokens','reports','blocks','bans','admin_audit_log'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);
  end loop;
end $$;

-- ---- profiles: world-readable (it's a social network), self-writable -------
create policy profiles_read   on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_insert on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

-- ---- user_roles: only staff may read; only via service role / admin fns ----
create policy user_roles_staff_read on public.user_roles for select to authenticated
  using ((select private.is_staff()));

-- ---- presence: anyone authenticated can read; you write only your own ------
create policy presence_read on public.presence for select to authenticated using (true);
create policy presence_write on public.presence for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- help_requests: visible to requester, assigned helper, or open nearby --
create policy help_requests_party_read on public.help_requests for select to authenticated
  using ((select auth.uid()) in (requester_id, helper_id) or status = 'requested');
create policy help_requests_insert on public.help_requests for insert to authenticated
  with check ((select auth.uid()) = requester_id);
create policy help_requests_party_update on public.help_requests for update to authenticated
  using ((select auth.uid()) in (requester_id, helper_id));

-- ---- conversations / participants / messages: members only ----------------
create policy conversations_member_read on public.conversations for select to authenticated
  using ((select private.in_conversation(id)));
create policy participants_self_read on public.conversation_participants for select to authenticated
  using ((select auth.uid()) = user_id or (select private.in_conversation(conversation_id)));
create policy participants_self_write on public.conversation_participants for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy messages_member_read on public.messages for select to authenticated
  using ((select private.in_conversation(conversation_id)));
create policy messages_send on public.messages for insert to authenticated
  with check ((select auth.uid()) = sender_id and (select private.in_conversation(conversation_id)));

-- ---- session_photos: only the two parties of the help_request -------------
create policy session_photos_party_read on public.session_photos for select to authenticated
  using (exists (select 1 from public.help_requests r
                 where r.id = help_request_id and (select auth.uid()) in (r.requester_id, r.helper_id)));
create policy session_photos_upload on public.session_photos for insert to authenticated
  with check ((select auth.uid()) = uploader_id);

-- ---- ratings: readable by all (drives public karma), insert as rater ------
create policy ratings_read on public.ratings for select to authenticated using (true);
create policy ratings_insert on public.ratings for insert to authenticated
  with check ((select auth.uid()) = rater_id);

-- ---- karma_ledger: you read your own; writes happen server-side -----------
create policy karma_ledger_self_read on public.karma_ledger for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---- spots / photos / tips: world-readable, authored writes ----------------
create policy spots_read on public.spots for select to authenticated using (true);
create policy spots_insert on public.spots for insert to authenticated
  with check ((select auth.uid()) = created_by);
create policy spots_update on public.spots for update to authenticated
  using ((select auth.uid()) = created_by or (select private.is_staff()));
create policy spot_photos_read on public.spot_photos for select to authenticated using (true);
create policy spot_tips_read on public.spot_tips for select to authenticated using (true);
create policy spot_tips_insert on public.spot_tips for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- ---- posts / likes / comments / follows: world-readable, authored writes --
create policy posts_read on public.posts for select to authenticated using (true);
create policy posts_insert on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy posts_update on public.posts for update to authenticated
  using ((select auth.uid()) = author_id or (select private.is_staff()));
create policy posts_delete on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id or (select private.is_staff()));
create policy post_likes_read on public.post_likes for select to authenticated using (true);
create policy post_likes_write on public.post_likes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy comments_read on public.comments for select to authenticated using (true);
create policy comments_insert on public.comments for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy comments_delete on public.comments for delete to authenticated
  using ((select auth.uid()) = author_id or (select private.is_staff()));
create policy follows_read on public.follows for select to authenticated using (true);
create policy follows_write on public.follows for all to authenticated
  using ((select auth.uid()) = follower_id) with check ((select auth.uid()) = follower_id);

-- ---- subscriptions: self-read only; writes via RevenueCat webhook (service) -
create policy subscriptions_self_read on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---- bookings: self only ---------------------------------------------------
create policy bookings_self on public.bookings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- businesses / sponsored_campaigns: staff-managed (B2B billed off-app) --
create policy businesses_staff on public.businesses for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy sponsored_staff on public.sponsored_campaigns for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- ---- itineraries / steps / ai_suggestions: self only -----------------------
create policy itineraries_self on public.itineraries for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy itinerary_steps_self on public.itinerary_steps for all to authenticated
  using (exists (select 1 from public.itineraries i
                 where i.id = itinerary_id and i.user_id = (select auth.uid())))
  with check (exists (select 1 from public.itineraries i
                 where i.id = itinerary_id and i.user_id = (select auth.uid())));
create policy ai_suggestions_self on public.ai_suggestions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- framing_tips: static content, world-readable --------------------------
create policy framing_tips_read on public.framing_tips for select to authenticated using (true);

-- ---- families / members: members read, owner manages ----------------------
create policy families_member_read on public.families for select to authenticated
  using ((select auth.uid()) = owner_id or exists (
    select 1 from public.family_members m where m.family_id = id and m.user_id = (select auth.uid())));
create policy families_owner_write on public.families for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy family_members_read on public.family_members for select to authenticated
  using ((select auth.uid()) = user_id or exists (
    select 1 from public.families f where f.id = family_id and f.owner_id = (select auth.uid())));

-- ---- notifications / push_tokens: self only --------------------------------
create policy notifications_self on public.notifications for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy push_tokens_self on public.push_tokens for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- reports: reporter inserts; staff read/triage --------------------------
create policy reports_insert on public.reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);
create policy reports_staff_read on public.reports for select to authenticated
  using ((select private.is_staff()) or (select auth.uid()) = reporter_id);
create policy reports_staff_update on public.reports for update to authenticated
  using ((select private.is_staff()));

-- ---- blocks: self only -----------------------------------------------------
create policy blocks_self on public.blocks for all to authenticated
  using ((select auth.uid()) = blocker_id) with check ((select auth.uid()) = blocker_id);

-- ---- bans / audit log: staff only ------------------------------------------
create policy bans_staff on public.bans for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy audit_staff_read on public.admin_audit_log for select to authenticated
  using ((select private.is_staff()));

-- ============================================================================
-- DATA API PRIVILEGES
-- RLS decides row access; these grants make the exposed public objects callable
-- by signed-in mobile clients on projects where new tables are not exposed by
-- default. No service-role or secret key is granted to the mobile app.
-- ============================================================================
grant usage on schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
grant usage on type presence_status to authenticated;
grant usage on type request_status to authenticated;
grant usage on type notification_kind to authenticated;
grant usage on type app_role to authenticated;
grant usage on type report_status to authenticated;
grant usage on type booking_status to authenticated;
grant usage on type itinerary_kind to authenticated;
grant usage on type store_kind to authenticated;
grant usage on type subscription_status to authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.leaderboard to authenticated;
grant execute on function public.find_available_helpers(double precision, double precision, int) to authenticated;

-- ============================================================================
-- end of migration
-- ============================================================================

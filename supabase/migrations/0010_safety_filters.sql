-- ============================================================================
-- 0010 — Trust & safety: ban-status self-check + matching exclusion (TASK-010)
-- ============================================================================
-- The reports / blocks / bans tables + report_status enum already exist (0001,
-- plus web-added report target columns). Mobile inserts `open` reports and self
-- `blocks` directly under RLS — no RPC needed for those.
--
-- What mobile CANNOT do directly:
--   1. Read its own ban: `bans` RLS is staff-only. Active ban is a row with
--      expires_at null/future (NOT profiles.is_banned, which web doesn't
--      maintain). -> SECURITY DEFINER `my_ban_status()` answers for the caller.
--   2. Exclude blocked/banned users from matching: `blocks`/`bans` are
--      RLS-restricted, so find_available_helpers (caller-rights) can't see them.
--      -> recreate it SECURITY DEFINER and add the exclusions.
-- ============================================================================

-- ---- public.my_ban_status: the caller's own active ban, for the gate ---------
-- Returns ZERO rows when not banned; one row when an active ban exists. Only
-- ever answers for auth.uid() — no probing other users.
create or replace function public.my_ban_status()
returns table (is_banned boolean, permanent boolean, expires_at timestamptz)
language sql security definer set search_path = public stable as $$
  select true as is_banned,
         (b.expires_at is null) as permanent,
         b.expires_at
  from public.bans b
  where b.user_id = (select auth.uid())
    and (b.expires_at is null or b.expires_at > now())
  order by (b.expires_at is null) desc, b.expires_at desc
  limit 1;
$$;
revoke all on function public.my_ban_status() from public, anon;
grant execute on function public.my_ban_status() to authenticated;

-- ---- find_available_helpers: now SECURITY DEFINER + safety exclusions --------
-- Same signature/returns as 0005 (so CREATE OR REPLACE is legal); definer so it
-- can read the RLS-restricted blocks/bans to exclude. Returns the same curated
-- columns it already exposed — no new data leaves the function.
create or replace function public.find_available_helpers(
  lng double precision,
  lat double precision,
  radius_m int default 1500
)
returns table (
  user_id uuid, first_name text, avatar_url text, karma int,
  rating numeric, verified boolean, distance_m double precision,
  lat double precision, lng double precision
)
language sql stable security definer set search_path = public, extensions as $$
  select p.id, p.first_name, p.avatar_url, p.karma, p.rating, p.verified,
         st_distance(pr.location, st_makepoint(lng, lat)::geography) as distance_m,
         st_y(pr.location::geometry) as lat,
         st_x(pr.location::geometry) as lng
  from public.presence pr
  join public.profiles p on p.id = pr.user_id
  where pr.status = 'available'
    and p.is_banned = false
    -- exclude users with an active ban (authoritative over is_banned)
    and not exists (
      select 1 from public.bans b
      where b.user_id = p.id and (b.expires_at is null or b.expires_at > now())
    )
    -- exclude either-direction blocks between the caller and the helper
    and not exists (
      select 1 from public.blocks bl
      where (bl.blocker_id = (select auth.uid()) and bl.blocked_id = p.id)
         or (bl.blocker_id = p.id and bl.blocked_id = (select auth.uid()))
    )
    and p.id <> (select auth.uid())
    and st_dwithin(pr.location, st_makepoint(lng, lat)::geography, radius_m)
  order by pr.location <-> st_makepoint(lng, lat)::geography
  limit 50;
$$;
grant execute on function public.find_available_helpers(double precision, double precision, int) to authenticated;

-- Return each available helper's coordinates so the map can place pins at their
-- real positions (not a cosmetic scatter). distance_m was already returned; this
-- adds lat/lng extracted from the presence geography point.
--
-- Return-type change requires drop + recreate (CREATE OR REPLACE can't alter it).

drop function if exists public.find_available_helpers(double precision, double precision, int);

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
-- not SECURITY DEFINER (runs as caller); needs `extensions` on the path for PostGIS.
language sql stable set search_path = public, extensions as $$
  select p.id, p.first_name, p.avatar_url, p.karma, p.rating, p.verified,
         st_distance(pr.location, st_makepoint(lng, lat)::geography) as distance_m,
         st_y(pr.location::geometry) as lat,
         st_x(pr.location::geometry) as lng
  from public.presence pr
  join public.profiles p on p.id = pr.user_id
  where pr.status = 'available'
    and p.is_banned = false
    and p.id <> (select auth.uid())
    and st_dwithin(pr.location, st_makepoint(lng, lat)::geography, radius_m)
  order by pr.location <-> st_makepoint(lng, lat)::geography
  limit 50;
$$;

grant execute on function public.find_available_helpers(double precision, double precision, int) to authenticated;

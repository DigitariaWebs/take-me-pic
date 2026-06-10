-- Harden profile writes so publishable-key clients cannot self-set trust flags.
--
-- RLS still owns row-level access (`profiles.id = auth.uid()`), while these
-- column grants restrict which fields an authenticated client may insert/update.

revoke insert, update on table public.profiles from authenticated;

grant insert (
  id,
  first_name,
  last_name,
  username,
  age,
  city,
  languages,
  bio,
  phone
) on table public.profiles to authenticated;

grant update (
  first_name,
  last_name,
  username,
  age,
  city,
  languages,
  bio,
  phone
) on table public.profiles to authenticated;

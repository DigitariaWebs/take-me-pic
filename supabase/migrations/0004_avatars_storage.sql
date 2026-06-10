-- Avatar storage: a public-read bucket with owner-scoped writes, plus the
-- profiles.avatar_url column grant so publishable-key clients can persist the
-- reference after a successful upload (0003 intentionally omitted avatar_url).

-- 1. Bucket. Public reads because avatars are shown on profiles and helper pins.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- 2. storage.objects policies for the avatars bucket.
--    Path convention is `{auth.uid()}/...`, so the first folder segment is the
--    owner — writes are restricted to a user's own top-level folder, reads are
--    public.
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 3. Let authenticated clients persist their own avatar reference. RLS still
--    enforces `profiles.id = auth.uid()` for the row; this only widens the
--    column allow-list from 0003 to include avatar_url.
grant insert (avatar_url) on table public.profiles to authenticated;
grant update (avatar_url) on table public.profiles to authenticated;

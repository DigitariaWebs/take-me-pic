-- Session photo transfer: a PRIVATE bucket readable/writable only by the two
-- parties of the photo's help request. Reads go through signed URLs.
--
-- Path convention: `{help_request_id}/<file>`, so the first folder segment is
-- the request id. A SECURITY DEFINER helper (with EXECUTE granted to
-- authenticated — the lesson from 0006) backs the policy so it doesn't depend on
-- help_requests RLS inside the storage predicate.

create or replace function private.is_session_party(req_id bigint)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.help_requests r
    where r.id = req_id and (select auth.uid()) in (r.requester_id, r.helper_id)
  );
$$;
grant execute on function private.is_session_party(bigint) to authenticated;

insert into storage.buckets (id, name, public)
values ('session-photos', 'session-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "session-photos party read" on storage.objects;
create policy "session-photos party read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'session-photos'
    and private.is_session_party(((storage.foldername(name))[1])::bigint)
  );

drop policy if exists "session-photos party insert" on storage.objects;
create policy "session-photos party insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'session-photos'
    and private.is_session_party(((storage.foldername(name))[1])::bigint)
  );

drop policy if exists "session-photos party delete" on storage.objects;
create policy "session-photos party delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'session-photos'
    and private.is_session_party(((storage.foldername(name))[1])::bigint)
  );

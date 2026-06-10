create or replace function public.accept_help_request(request_id bigint)
returns table (
  help_request_id bigint,
  conversation_id bigint,
  status request_status,
  requester_id uuid,
  helper_id uuid,
  accepted_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $function$
#variable_conflict use_column
declare
  v_helper_id uuid := auth.uid();
  v_request public.help_requests%rowtype;
  v_conversation_id bigint;
begin
  if v_helper_id is null then
    raise exception 'not authenticated'
      using errcode = '28000';
  end if;
  select *
  into v_request
  from public.help_requests
  where id = accept_help_request.request_id
  for update;
  if not found then
    raise exception 'help request not found'
      using errcode = 'P0002';
  end if;
  if v_request.status = 'accepted' and v_request.helper_id = v_helper_id then
    select c.id
    into v_conversation_id
    from public.conversations c
    where c.help_request_id = accept_help_request.request_id
    limit 1;
    return query
    select
      v_request.id,
      v_conversation_id,
      v_request.status,
      v_request.requester_id,
      v_request.helper_id,
      v_request.accepted_at;
    return;
  end if;
  if v_request.status <> 'requested' then
    raise exception 'help request is not open for acceptance (status: %)', v_request.status
      using errcode = 'P0001';
  end if;
  if v_request.expires_at <= now() then
    raise exception 'help request has expired'
      using errcode = 'P0001';
  end if;
  if v_request.requester_id = v_helper_id then
    raise exception 'cannot accept your own help request'
      using errcode = 'P0001';
  end if;
  if exists (
    select 1
    from public.profiles p
    where p.id = v_helper_id
      and p.is_banned = true
  ) then
    raise exception 'helper is banned'
      using errcode = 'P0001';
  end if;
  update public.help_requests hr
  set
    helper_id = v_helper_id,
    status = 'accepted',
    accepted_at = now()
  where hr.id = accept_help_request.request_id
    and hr.status = 'requested'
    and hr.helper_id is null
  returning * into v_request;
  if not found then
    raise exception 'help request was already accepted by another helper'
      using errcode = 'P0001';
  end if;
  select c.id
  into v_conversation_id
  from public.conversations c
  where c.help_request_id = accept_help_request.request_id;
  if v_conversation_id is null then
    insert into public.conversations (help_request_id)
    values (accept_help_request.request_id)
    returning id into v_conversation_id;
  end if;
  insert into public.conversation_participants (conversation_id, user_id)
  values
    (v_conversation_id, v_request.requester_id),
    (v_conversation_id, v_helper_id)
  on conflict on constraint conversation_participants_pkey do nothing;
  return query
  select
    v_request.id,
    v_conversation_id,
    v_request.status,
    v_request.requester_id,
    v_request.helper_id,
    v_request.accepted_at;
end;
$function$;

revoke all on function public.accept_help_request(bigint) from public;
revoke all on function public.accept_help_request(bigint) from anon;
grant execute on function public.accept_help_request(bigint) to authenticated;

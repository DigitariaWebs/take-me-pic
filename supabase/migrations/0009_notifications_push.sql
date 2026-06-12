-- ============================================================================
-- 0009 — Notification creation + push delivery (TASK-009)
-- ============================================================================
-- The `notifications` and `push_tokens` tables already exist (0001). This
-- migration adds the SERVER-SIDE emission: DB triggers that write the canonical
-- in-app `notifications` row AND fan a push out via pg_net -> Expo Push API on
-- the three events that matter to a backgrounded/killed user:
--
--   1. help_requests  requested -> accepted   -> notify the requester
--   2. help_requests  INSERT                  -> notify nearby available helpers
--   3. messages       INSERT                  -> notify the other participant(s)
--
-- Push is the delivery path for backgrounded/killed devices (realtime is
-- foreground-only). The in-app row is canonical; push is best-effort and never
-- fails the originating transaction. Payloads carry NO message text and NO
-- precise location — only a generic title/body and routing IDs in `data`.
-- ============================================================================

create extension if not exists pg_net;

-- ----------------------------------------------------------------------------
-- private.dispatch_push — fan a single notification out to a user's devices.
-- SECURITY DEFINER so it can read another user's push_tokens and call pg_net
-- from inside a trigger fired by an ordinary `authenticated` writer. Wrapped so
-- a delivery failure can never roll back the canonical notification insert.
-- ----------------------------------------------------------------------------
create or replace function private.dispatch_push(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public, private, net
as $$
declare
  v_token text;
begin
  for v_token in
    select token from public.push_tokens where user_id = p_user_id
  loop
    begin
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Accept', 'application/json'
        ),
        body := jsonb_build_object(
          'to', v_token,
          'title', p_title,
          'body', p_body,
          'data', coalesce(p_data, '{}'::jsonb),
          'sound', 'default',
          'priority', 'high',
          'channelId', 'default'
        )
      );
    exception when others then
      -- A single bad token / transient pg_net error must not abort the others
      -- or the surrounding write. Pruning of dead tokens is receipt-driven and
      -- handled out of band.
      null;
    end;
  end loop;
end;
$$;

revoke all on function private.dispatch_push(uuid, text, text, jsonb) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- private.notify_user — write the canonical in-app row, then dispatch push.
-- The insert is authoritative; dispatch_push swallows its own failures.
-- ----------------------------------------------------------------------------
create or replace function private.notify_user(
  p_user_id uuid,
  p_kind notification_kind,
  p_body text,
  p_emphasis text,
  p_push_title text,
  p_push_body text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.notifications (user_id, kind, body, emphasis, data)
  values (p_user_id, p_kind, p_body, p_emphasis, p_data);

  perform private.dispatch_push(p_user_id, p_push_title, p_push_body, p_data);
end;
$$;

revoke all on function private.notify_user(uuid, notification_kind, text, text, text, text, jsonb) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 1. Request accepted -> notify the requester.
-- Fires once: the help_requests_transition guard (0001) permits a single
-- requested -> accepted move, so this is idempotent by construction. The
-- conversation is created later in accept_help_request (after this UPDATE), so
-- the payload routes by request_id; the client opens the conversation from the
-- sent-request screen.
-- ----------------------------------------------------------------------------
create or replace function private.on_request_accepted()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.status = 'requested' and new.status = 'accepted' then
    perform private.notify_user(
      new.requester_id,
      'request'::notification_kind,
      'Quelqu''un a accepté votre demande de photo.',
      'gold',
      'Demande acceptée',
      'Un helper arrive pour votre photo.',
      jsonb_build_object('type', 'request_accepted', 'request_id', new.id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists help_requests_notify_accepted on public.help_requests;
create trigger help_requests_notify_accepted
  after update of status on public.help_requests
  for each row execute function private.on_request_accepted();

-- ----------------------------------------------------------------------------
-- 2. New request -> notify nearby available helpers.
-- Mirrors find_available_helpers (0005): available presence, not banned, not
-- the requester, within each helper's own share_radius_m of the request point.
-- One notification per matching helper; each request row is a distinct event.
-- ----------------------------------------------------------------------------
create or replace function private.on_request_created()
returns trigger
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  v_helper uuid;
begin
  for v_helper in
    select p.id
    from public.presence pr
    join public.profiles p on p.id = pr.user_id
    where pr.status = 'available'
      and p.is_banned = false
      and p.id <> new.requester_id
      and st_dwithin(pr.location, new.location, pr.share_radius_m)
  loop
    perform private.notify_user(
      v_helper,
      'request'::notification_kind,
      'Une nouvelle demande de photo près de vous.',
      'red',
      'Demande de photo',
      'Quelqu''un cherche un photographe près de vous.',
      jsonb_build_object('type', 'incoming_request', 'request_id', new.id)
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists help_requests_notify_created on public.help_requests;
create trigger help_requests_notify_created
  after insert on public.help_requests
  for each row execute function private.on_request_created();

-- ----------------------------------------------------------------------------
-- 3. New message -> notify the other participant(s).
-- Message text is intentionally NOT included in the payload; only the sender's
-- first name and the conversation_id for routing.
-- ----------------------------------------------------------------------------
create or replace function private.on_message_created()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_recipient uuid;
  v_sender_name text;
begin
  select coalesce(first_name, 'Quelqu''un') into v_sender_name
  from public.profiles where id = new.sender_id;

  for v_recipient in
    select user_id
    from public.conversation_participants
    where conversation_id = new.conversation_id
      and user_id <> new.sender_id
  loop
    perform private.notify_user(
      v_recipient,
      'request'::notification_kind,
      v_sender_name || ' vous a envoyé un message.',
      'normal',
      'Nouveau message',
      v_sender_name || ' vous a envoyé un message.',
      jsonb_build_object('type', 'new_message', 'conversation_id', new.conversation_id)
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists messages_notify_created on public.messages;
create trigger messages_notify_created
  after insert on public.messages
  for each row execute function private.on_message_created();

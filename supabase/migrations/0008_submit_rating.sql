-- Server-owned rating + karma. Submitting a rating must (a) be by a session
-- participant, (b) target the other party, (c) be one-per-rater-per-session,
-- and (d) deterministically bump the ratee's karma + ledger. The ratings RLS
-- only checks rater = self, and nothing updated karma — this RPC owns all of it.
--
-- MVP karma rule: a rating adds `stars` (1..5) to the ratee's karma.
-- MVP session gate: status must be at least 'accepted' (the session-completion
-- transition isn't wired yet; tighten to 'completed' when it is).

-- one rating per rater per session
create unique index if not exists ratings_rater_request_uidx
  on public.ratings (rater_id, help_request_id);

create or replace function public.submit_rating(
  p_request_id bigint,
  p_stars int,
  p_comment text default null
)
returns table (rating_id bigint, ratee_id uuid, new_karma int)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_rater uuid := auth.uid();
  v_req public.help_requests%rowtype;
  v_ratee uuid;
  v_rating_id bigint;
  v_karma int;
begin
  if v_rater is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_stars < 1 or p_stars > 5 then
    raise exception 'stars must be between 1 and 5' using errcode = 'P0001';
  end if;

  select * into v_req from public.help_requests where id = p_request_id;
  if not found then
    raise exception 'session not found' using errcode = 'P0002';
  end if;
  if v_rater not in (v_req.requester_id, v_req.helper_id) then
    raise exception 'not a session participant' using errcode = 'P0001';
  end if;
  if v_req.status not in ('accepted', 'in_session', 'completed', 'rated') then
    raise exception 'session is not active or completed' using errcode = 'P0001';
  end if;

  v_ratee := case when v_rater = v_req.requester_id then v_req.helper_id else v_req.requester_id end;
  if v_ratee is null then
    raise exception 'no counterpart to rate' using errcode = 'P0001';
  end if;

  -- idempotent: if already rated, return the existing rating + current karma
  select id into v_rating_id from public.ratings
  where rater_id = v_rater and help_request_id = p_request_id;
  if v_rating_id is not null then
    select karma into v_karma from public.profiles where id = v_ratee;
    return query select v_rating_id, v_ratee, v_karma;
    return;
  end if;

  insert into public.ratings (help_request_id, rater_id, ratee_id, stars, comment)
  values (p_request_id, v_rater, v_ratee, p_stars, p_comment)
  returning id into v_rating_id;

  insert into public.karma_ledger (user_id, delta, reason, help_request_id)
  values (v_ratee, p_stars, 'rating', p_request_id);

  update public.profiles set karma = karma + p_stars
  where id = v_ratee
  returning karma into v_karma;

  return query select v_rating_id, v_ratee, v_karma;
end;
$$;

revoke all on function public.submit_rating(bigint, int, text) from public, anon;
grant execute on function public.submit_rating(bigint, int, text) to authenticated;

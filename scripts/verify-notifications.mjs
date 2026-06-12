// Verify TASK-009 backend behavior against the LIVE Supabase project with the
// publishable key + real test accounts. Run AFTER applying 0009:
//
//   node scripts/apply-migration.mjs supabase/migrations/0009_notifications_push.sql
//   node scripts/verify-notifications.mjs
//
// Covers what two publishable-key sessions can prove without a service role:
//   - push_tokens ownership + stale/replaced-token re-bind (on conflict (token))
//   - notifications RLS self-scoping + read-state (read_at) persistence
//   - server message-trigger row creation IF the two accounts already share a
//     conversation (best-effort; skipped otherwise)
//
// Account B is optional: cross-user assertions are skipped if it can't sign in.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const l of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^([A-Z_]+)=(.*)$/.exec(l.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.EXPO_PUBLIC_SUPABASE_KEY;

const mk = () => createClient(url, key, { auth: { persistSession: false } });

const A = mk();
const B = mk();

const a = await A.auth.signInWithPassword({ email: 'touaitiaaliali@gmail.com', password: 'Azerty123' });
if (a.error) { console.log('A AUTH FAILED:', a.error.message); process.exit(1); }
const uidA = a.data.user.id;
console.log('A signed in:', uidA);

const b = await B.auth.signInWithPassword({ email: 'maestro+verified@takemepic.test', password: 'Maestro-Test-1!' });
const uidB = b.error ? null : b.data.user.id;
console.log('B signed in:', uidB ?? `(unavailable: ${b.error?.message})`, '\n');

let pass = 0, fail = 0;
const ok = (label, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`); cond ? pass++ : fail++; };

// ── push_tokens: ownership + re-bind ───────────────────────────────────────
const TOKEN = 'ExponentPushToken[verify-task009-fixed]';
await A.from('push_tokens').delete().eq('token', TOKEN);

const insA = await A.from('push_tokens').upsert({ user_id: uidA, token: TOKEN, platform: 'apple' }, { onConflict: 'token' });
ok('A registers push token', !insA.error, insA.error?.message);

const ownA = await A.from('push_tokens').select('user_id').eq('token', TOKEN).maybeSingle();
ok('token owned by A', ownA.data?.user_id === uidA);

if (uidB) {
  const insB = await B.from('push_tokens').upsert({ user_id: uidB, token: TOKEN, platform: 'apple' }, { onConflict: 'token' });
  ok('B re-binds the same token (stale/replaced handling)', !insB.error, insB.error?.message);

  const ownB = await B.from('push_tokens').select('user_id').eq('token', TOKEN).maybeSingle();
  ok('token now owned by B', ownB.data?.user_id === uidB);

  const aSeesIt = await A.from('push_tokens').select('id').eq('token', TOKEN).maybeSingle();
  ok('A can no longer read the re-bound token (RLS)', !aSeesIt.data);
  await B.from('push_tokens').delete().eq('token', TOKEN);
} else {
  await A.from('push_tokens').delete().eq('token', TOKEN);
  console.log('SKIP  cross-user token re-bind (account B unavailable)');
}

// ── notifications: self-insert, read-state, RLS ────────────────────────────
const ins = await A.from('notifications')
  .insert({ user_id: uidA, kind: 'system', body: 'verify-task009 self note', data: { type: 'test' } })
  .select('id, read_at')
  .single();
ok('A inserts own notification', !ins.error, ins.error?.message);
const notifId = ins.data?.id;

if (notifId) {
  ok('new notification starts unread', ins.data.read_at === null);

  const mark = await A.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notifId).is('read_at', null);
  ok('A marks it read', !mark.error, mark.error?.message);

  const reread = await A.from('notifications').select('read_at').eq('id', notifId).single();
  ok('read_at persists', reread.data?.read_at != null);

  if (uidB) {
    const bRead = await B.from('notifications').select('id').eq('id', notifId).maybeSingle();
    ok("B cannot read A's notification (RLS)", !bRead.data);
  }
  await A.from('notifications').delete().eq('id', notifId);
}

// ── message trigger (best-effort: needs an existing shared conversation) ───
if (uidB) {
  const convs = await A.from('conversation_participants').select('conversation_id').eq('user_id', uidA);
  const aConvIds = (convs.data ?? []).map((r) => r.conversation_id);
  let shared = null;
  if (aConvIds.length) {
    const bConvs = await B.from('conversation_participants').select('conversation_id').in('conversation_id', aConvIds);
    shared = bConvs.data?.[0]?.conversation_id ?? null;
  }
  if (shared != null) {
    const before = await B.from('notifications').select('id').contains('data', { type: 'new_message' });
    const beforeN = before.data?.length ?? 0;
    const msg = await A.from('messages').insert({ conversation_id: shared, sender_id: uidA, body: 'verify-task009 ping' }).select('id').single();
    ok('A sends a message (trigger fires, insert not blocked)', !msg.error, msg.error?.message);
    await new Promise((r) => setTimeout(r, 1500));
    const after = await B.from('notifications').select('id').contains('data', { type: 'new_message' });
    ok('message trigger created a new_message notification for B', (after.data?.length ?? 0) > beforeN);
  } else {
    console.log('SKIP  message-trigger check (no conversation shared by A & B)');
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

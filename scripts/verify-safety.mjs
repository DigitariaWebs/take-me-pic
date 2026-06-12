// Verify TASK-010 backend behavior against the LIVE Supabase project with the
// publishable key + a real test account. Run AFTER applying 0010:
//
//   node scripts/apply-migration.mjs supabase/migrations/0010_safety_filters.sql
//   node scripts/verify-safety.mjs
//
// Covers: report insert (one target, status forced 'open' by default), block
// idempotency + unblock + RLS-scoped read, my_ban_status() self-check, and a
// post-migration sanity call of the now-SECURITY-DEFINER find_available_helpers.
// Test report rows are tagged 'verify-task010' for management-API cleanup.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const l of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^([A-Z_]+)=(.*)$/.exec(l.trim());
  if (m) env[m[1]] = m[2];
}
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.EXPO_PUBLIC_SUPABASE_KEY;
const s = createClient(url, key, { auth: { persistSession: false } });

const a = await s.auth.signInWithPassword({ email: 'touaitiaaliali@gmail.com', password: 'Azerty123' });
if (a.error) { console.log('AUTH FAILED:', a.error.message); process.exit(1); }
const uid = a.data.user.id;
console.log('signed in as', uid, '\n');

let pass = 0, fail = 0;
const ok = (label, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`); cond ? pass++ : fail++; };

// A second real profile to target.
const otherQ = await s.from('profiles').select('id').neq('id', uid).limit(1).maybeSingle();
const otherId = otherQ.data?.id ?? null;
console.log('target profile:', otherId ?? '(none found — some checks skipped)', '\n');

// ── reports: insert with one target, default status open ───────────────────
if (otherId) {
  const ins = await s.from('reports')
    .insert({ reporter_id: uid, reported_user_id: otherId, reason: 'verify-task010' })
    .select('id, status, reported_user_id')
    .single();
  ok('report insert (reported_user_id)', !ins.error, ins.error?.message);
  ok('report defaults to status=open', ins.data?.status === 'open');

  // Cross-user RLS: reporter_id must be self.
  const bad = await s.from('reports')
    .insert({ reporter_id: otherId, reported_user_id: uid, reason: 'verify-task010-rls' })
    .select('id');
  ok('cannot insert a report as another reporter (RLS)', Boolean(bad.error));
}

// ── blocks: idempotent block, read, unblock ────────────────────────────────
if (otherId) {
  await s.from('blocks').delete().eq('blocker_id', uid).eq('blocked_id', otherId);

  const b1 = await s.from('blocks').upsert({ blocker_id: uid, blocked_id: otherId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true });
  ok('block insert', !b1.error, b1.error?.message);
  const b2 = await s.from('blocks').upsert({ blocker_id: uid, blocked_id: otherId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true });
  ok('re-block is idempotent (no error)', !b2.error, b2.error?.message);

  const read = await s.from('blocks').select('blocked_id').eq('blocker_id', uid).eq('blocked_id', otherId).maybeSingle();
  ok('block row readable by blocker', read.data?.blocked_id === otherId);

  const un = await s.from('blocks').delete().eq('blocker_id', uid).eq('blocked_id', otherId);
  ok('unblock deletes the row', !un.error, un.error?.message);
  const after = await s.from('blocks').select('blocked_id').eq('blocker_id', uid).eq('blocked_id', otherId).maybeSingle();
  ok('block row gone after unblock', !after.data);
}

// ── my_ban_status(): self-check returns not-banned for A ───────────────────
const ban = await s.rpc('my_ban_status');
ok('my_ban_status() callable by authenticated', !ban.error, ban.error?.message);
ok('A is not banned (zero rows)', (ban.data?.length ?? 0) === 0);

// ── find_available_helpers still works after the SECURITY DEFINER change ────
const helpers = await s.rpc('find_available_helpers', { lng: 2.3522, lat: 48.8566, radius_m: 3000 });
ok('find_available_helpers callable post-migration', !helpers.error, helpers.error?.message);
ok('A is never in its own helper results', !(helpers.data ?? []).some((h) => h.user_id === uid));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

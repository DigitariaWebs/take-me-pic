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

const { data: auth, error: authErr } = await s.auth.signInWithPassword({
  email: 'touaitiaaliali@gmail.com',
  password: 'Azerty123',
});
if (authErr) { console.log('AUTH FAILED:', authErr.message); process.exit(1); }
const uid = auth.user.id;
console.log('signed in as', uid, '\n');

const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46]); // tiny jpeg header

// AC1: upload to own path works with publishable key
const ownPath = `${uid}/avatar.jpg`;
const up = await s.storage.from('avatars').upload(ownPath, bytes, { contentType: 'image/jpeg', upsert: true });
console.log('AC1 own-path upload:', up.error ? `FAIL (${up.error.message})` : 'PASS');

// AC2: cannot write another user's path
const otherPath = `00000000-0000-0000-0000-000000000000/avatar.jpg`;
const other = await s.storage.from('avatars').upload(otherPath, bytes, { contentType: 'image/jpeg', upsert: true });
console.log('AC2 cross-user write denied:', other.error ? 'PASS (denied)' : 'FAIL (upload was allowed!)');

// AC3: public read works
const publicUrl = s.storage.from('avatars').getPublicUrl(ownPath).data.publicUrl;
let readStatus = 'n/a';
try { const r = await fetch(publicUrl); readStatus = r.status; } catch (e) { readStatus = 'fetch-error ' + e.message; }
console.log('AC3 public read:', readStatus === 200 ? 'PASS (200)' : `FAIL (${readStatus})`);

// AC5: profile write stores avatar_url (needs 0004 column grant)
const upd = await s.from('profiles').update({ avatar_url: publicUrl }).eq('id', uid).select('avatar_url').maybeSingle();
console.log('AC5 persist avatar_url:', upd.error ? `FAIL (${upd.error.message})` : `PASS (stored: ${upd.data?.avatar_url ? 'yes' : 'no'})`);

console.log('\n(AC4 "link profile page to real data" = UI work, not in PR #3.)');
console.log('(AC6 failure-safety = code ordering in useUploadAvatar: upload first, persist only on success.)');

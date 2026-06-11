#!/usr/bin/env node

// Apply a SQL migration file to the remote Supabase project via the Management
// API. Reads the project ref from EXPO_PUBLIC_SUPABASE_URL and the token from
// SUPABASE_ACCESS_TOKEN in .env.
//
//   node scripts/apply-migration.mjs supabase/migrations/0004_avatars_storage.sql
//
// This mutates the live database — run it deliberately.

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/apply-migration.mjs <path-to-.sql>');
  process.exit(1);
}

const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}

const ref = (env.EXPO_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1];
const token = env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL ref or SUPABASE_ACCESS_TOKEN in .env');
  process.exit(1);
}

const query = readFileSync(file, 'utf8');
console.log(`Applying ${file} to project ${ref} ...`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`FAILED (${res.status} ${res.statusText}): ${text.slice(0, 800)}`);
  process.exit(1);
}
console.log(`OK (${res.status}). ${text.slice(0, 300)}`);

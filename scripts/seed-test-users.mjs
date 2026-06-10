#!/usr/bin/env node

// Seed deterministic Supabase test users for Maestro gate-state coverage.
//
// The trusted-profile gate (TASK-002) has states Maestro can only exercise with
// pre-seeded backend fixtures: verified-with-profile, email-unverified, banned,
// and authenticated-but-missing-profile. This script creates them idempotently
// via the Supabase Admin API so those flows stop being "manual only".
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-test-users.mjs
//   node scripts/seed-test-users.mjs --reset   # delete the seeded users first
//
// Requires the SERVICE ROLE key (admin). NEVER commit it or expose it to the
// app bundle — it is server-only and bypasses RLS by design. Falls back to
// EXPO_PUBLIC_SUPABASE_URL for the project url.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESET = process.argv.includes('--reset');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env. Set SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'Maestro-Test-1!';

// Each fixture maps to a Maestro gate state. `profile` is inserted into the
// `profiles` table only when present — adjust the columns here if the schema
// drifts. Server-owned flags (verified/is_banned) are set here intentionally,
// because this runs with the service role, not the publishable client.
const FIXTURES = [
  {
    key: 'verified',
    email: 'maestro+verified@takemepic.test',
    emailConfirm: true,
    banned: false,
    profile: {
      first_name: 'Vera',
      username: 'maestro_verified',
      age: 27,
      city: 'Montreal',
      languages: ['en', 'fr'],
    },
  },
  {
    key: 'unverified',
    email: 'maestro+unverified@takemepic.test',
    emailConfirm: false,
    banned: false,
    profile: null, // unconfirmed email -> gate stops before profile completion
  },
  {
    key: 'missing-profile',
    email: 'maestro+noprofile@takemepic.test',
    emailConfirm: true,
    banned: false,
    profile: null, // confirmed but no profile row -> routed to profile completion
  },
  {
    key: 'banned',
    email: 'maestro+banned@takemepic.test',
    emailConfirm: true,
    banned: true,
    profile: {
      first_name: 'Ben',
      username: 'maestro_banned',
      age: 30,
      city: 'Laval',
      languages: ['en'],
    },
  },
];

async function findUserByEmail(email) {
  // listUsers is paginated; the test project is small so one page is plenty.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    throw error;
  }
  return data.users.find((user) => user.email === email) ?? null;
}

async function deleteFixture(fixture) {
  const existing = await findUserByEmail(fixture.email);
  if (!existing) {
    return;
  }
  await admin.auth.admin.deleteUser(existing.id);
  console.log(`deleted ${fixture.key} (${fixture.email})`);
}

async function upsertFixture(fixture) {
  let user = await findUserByEmail(fixture.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: fixture.email,
      password: PASSWORD,
      email_confirm: fixture.emailConfirm,
    });
    if (error) {
      throw error;
    }
    user = data.user;
    console.log(`created ${fixture.key} (${fixture.email})`);
  } else {
    console.log(`exists  ${fixture.key} (${fixture.email})`);
  }

  if (fixture.banned) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { ban_duration: '876000h' });
    if (error) {
      console.warn(`  ! could not ban via auth: ${error.message}`);
    }
  }

  if (fixture.profile) {
    const row = { id: user.id, ...fixture.profile };
    if (fixture.banned) {
      row.is_banned = true;
    }
    const { error } = await admin.from('profiles').upsert(row, { onConflict: 'id' });
    if (error) {
      // Don't fail the whole seed on a schema mismatch — surface it loudly so
      // the FIXTURES profile shape can be corrected against the live schema.
      console.warn(`  ! profile upsert failed for ${fixture.key}: ${error.message}`);
    }
  }
}

async function main() {
  console.log(`Seeding Maestro test users against ${SUPABASE_URL}${RESET ? ' (reset)' : ''}`);
  console.log(`Shared password: ${PASSWORD}\n`);

  for (const fixture of FIXTURES) {
    try {
      if (RESET) {
        await deleteFixture(fixture);
      } else {
        await upsertFixture(fixture);
      }
    } catch (error) {
      console.error(`x ${fixture.key}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main();

#!/usr/bin/env node
/**
 * Applies schema (if DB password provided) and seeds demo users via Auth signup.
 *
 * Optional in .env for automatic SQL apply:
 *   SUPABASE_DB_PASSWORD=your-database-password
 *
 * Auth requirement:
 *   Disable "Confirm email" in Supabase Auth settings for local seeding,
 *   or confirm each seeded user manually.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];

function applySchemaWithPsql() {
  if (!dbPassword) {
    console.log("\n⏭  Skipping automatic SQL apply (no SUPABASE_DB_PASSWORD in .env).");
    console.log("   Open Supabase → SQL Editor and run:");
    console.log("   supabase/migrations/001_initial_schema.sql\n");
    return false;
  }

  const sqlPath = resolve(root, "supabase/migrations/001_initial_schema.sql");
  const connection = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  console.log("Applying schema via pooler...");
  const result = spawnSync("psql", [connection, "-v", "ON_ERROR_STOP=1", "-f", sqlPath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    // Try direct db host as fallback
    const direct = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
    const retry = spawnSync("psql", [direct, "-v", "ON_ERROR_STOP=1", "-f", sqlPath], {
      encoding: "utf8",
    });
    if (retry.status !== 0) {
      console.error(result.stderr || result.stdout || retry.stderr || retry.stdout);
      console.error("\nCould not apply SQL automatically. Run the migration in the Supabase SQL Editor.");
      return false;
    }
  }

  console.log("✓ Schema applied");
  return true;
}

const seedUsers = [
  {
    email: "admin@afsp.com",
    password: "Admin123!",
    data: { role: "admin", name: "Platform Admin" },
  },
  {
    email: "marcus@afsp.com",
    password: "Coach123!",
    data: { role: "coach", name: "Marcus Webb" },
  },
  {
    email: "jordan@afsp.com",
    password: "Athlete123!",
    data: { role: "athlete", name: "Jordan Cole", sport: "Football", created_by: "self" },
  },
];

async function seedAuthUsers(supabase) {
  for (const user of seedUsers) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: { data: user.data },
    });

    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        console.log(`• ${user.email} already exists`);
      } else {
        console.error(`✗ ${user.email}: ${error.message}`);
      }
    } else {
      console.log(`✓ Created ${user.email} (${user.data.role}) id=${data.user?.id ?? "pending"}`);
    }

    await supabase.auth.signOut();
  }
}

async function seedJournal(supabase) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: "jordan@afsp.com",
    password: "Athlete123!",
  });

  if (signInError) {
    console.log(`⏭  Skipping journal seed (cannot sign in as jordan): ${signInError.message}`);
    return;
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("athlete_email", "jordan@afsp.com")
    .limit(1);

  if (existing?.length) {
    console.log("• Journal seed already present");
    await supabase.auth.signOut();
    return;
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("email", "jordan@afsp.com")
    .maybeSingle();

  const { error } = await supabase.from("journal_entries").insert({
    athlete_id: athlete?.id ?? null,
    athlete_email: "jordan@afsp.com",
    athlete_name: "Jordan Cole",
    body: "Felt explosive today. Sprint block starts were sharp and recovery felt solid.",
    media: [],
  });

  if (error) {
    console.error(`✗ Journal seed failed: ${error.message}`);
    console.error("  (Apply the SQL migration first if tables are missing.)");
  } else {
    console.log("✓ Seeded sample journal entry for Jordan Cole");
  }

  await supabase.auth.signOut();
}

async function main() {
  applySchemaWithPsql();

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Seeding auth users...");
  await seedAuthUsers(supabase);
  console.log("Seeding journal demo data...");
  await seedJournal(supabase);
  console.log("\nDone. Demo logins:");
  console.log("  admin@afsp.com / Admin123!");
  console.log("  marcus@afsp.com / Coach123!");
  console.log("  jordan@afsp.com / Athlete123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

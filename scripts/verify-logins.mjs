import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const users = [
  { email: "admin@afsp.com", password: "Admin123!", role: "admin" },
  { email: "marcus@afsp.com", password: "Coach123!", role: "coach" },
  { email: "jordan@afsp.com", password: "Athlete123!", role: "athlete" },
];

for (const u of users) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: u.email,
    password: u.password,
  });
  if (error || !data.user) {
    console.log(`LOGIN FAIL ${u.email}: ${error?.message ?? "no user"}`);
    continue;
  }
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, role, name, email")
    .eq("id", data.user.id)
    .maybeSingle();
  if (pErr) {
    console.log(`PROFILE ERR ${u.email}: ${pErr.message}`);
  } else if (!profile) {
    console.log(`PROFILE MISSING ${u.email}`);
  } else {
    console.log(`OK ${u.email} role=${profile.role} name=${profile.name}`);
  }
  await supabase.auth.signOut();
}

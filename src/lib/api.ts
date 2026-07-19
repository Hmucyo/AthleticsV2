import { supabase } from "./supabase";
import type {
  AthleteDetails,
  AthleteRecord,
  JournalEntryRow,
  JournalMedia,
  Profile,
  Role,
} from "./database.types";
import type { User } from "@supabase/supabase-js";

export interface AuthResult {
  success: boolean;
  message: string;
  profile?: Profile;
  needsEmailConfirmation?: boolean;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile", error);
    return null;
  }
  return data;
}

export async function ensureProfileFromUser(user: User): Promise<Profile | null> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;

  const meta = user.user_metadata ?? {};
  const role = (meta.role as Role) || "athlete";
  const name = (meta.name as string) || user.email?.split("@")[0] || "Athlete";
  const email = (user.email || "").toLowerCase();
  const sport = (meta.sport as string) || "General";

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role,
    name,
    email,
  });

  if (profileError) {
    console.error("ensureProfileFromUser profile", profileError);
    return null;
  }

  if (role === "athlete") {
    await supabase.from("athletes").upsert(
      {
        user_id: user.id,
        name,
        email,
        sport,
        created_by: (meta.created_by as "admin" | "self") || "self",
        details: {},
      },
      { onConflict: "email" }
    );
  }

  return fetchProfile(user.id);
}

export async function loginWithPassword(payload: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = payload.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: payload.password,
  });

  if (error || !data.user) {
    const message = error?.message ?? "Unable to sign in. Check your credentials.";
    if (/confirm|confirmation|not confirmed/i.test(message)) {
      return {
        success: false,
        message: "Please confirm your email before signing in. Check your inbox for the link.",
      };
    }
    return { success: false, message };
  }

  const profile = (await fetchProfile(data.user.id)) ?? (await ensureProfileFromUser(data.user));
  if (!profile) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Signed in, but no profile was found. Ask an admin to run the database setup.",
    };
  }

  return {
    success: true,
    message: `Welcome back, ${profile.name}.`,
    profile,
  };
}

export async function signUpAthlete(payload: {
  name: string;
  email: string;
  password: string;
  sport: string;
}): Promise<AuthResult> {
  const email = payload.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: {
        role: "athlete",
        name: payload.name.trim(),
        sport: payload.sport.trim(),
        created_by: "self",
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return {
      success: false,
      message: "Sign up did not return a user. Check Auth settings in Supabase.",
    };
  }

  if (!data.session) {
    return {
      success: true,
      needsEmailConfirmation: true,
      message: "Account created. Check your email to confirm, then sign in.",
    };
  }

  let profile = await fetchProfile(data.user.id);
  for (let attempt = 0; attempt < 5 && !profile; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    profile = await fetchProfile(data.user.id);
  }
  if (!profile) {
    profile = await ensureProfileFromUser(data.user);
  }

  if (!profile) {
    return {
      success: false,
      message: "Account created, but profile setup failed. Try signing in after a moment.",
    };
  }

  return {
    success: true,
    message: "Athlete account created. You are now signed in.",
    profile,
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function createCoachAccount(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { data: adminData, error: adminError } = await supabase.auth.getSession();
  if (adminError || !adminData.session) {
    return { success: false, message: "Admin session expired. Sign in again." };
  }

  const adminSession = adminData.session;
  const email = payload.email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: {
        role: "coach",
        name: payload.name.trim(),
      },
    },
  });

  await supabase.auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return { success: false, message: "Coach account was not created." };
  }

  return {
    success: true,
    message: `Coach login created for ${payload.name.trim()}.`,
  };
}

export async function createAthleteProfile(payload: {
  name: string;
  email: string;
  sport: string;
}): Promise<AuthResult> {
  const { data, error } = await supabase.rpc("admin_create_athlete_profile", {
    p_name: payload.name.trim(),
    p_email: payload.email.trim().toLowerCase(),
    p_sport: payload.sport.trim(),
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: `Athlete profile created for ${(data as AthleteRecord)?.name ?? payload.name}.`,
  };
}

export async function fetchAthleteByEmail(email: string): Promise<AthleteRecord | null> {
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("fetchAthleteByEmail", error);
    return null;
  }
  return data;
}

export async function updateAthleteSelfProfile(payload: {
  userId: string;
  email: string;
  name: string;
  sport: string;
  phone?: string;
  details: AthleteDetails;
}): Promise<AuthResult> {
  const email = payload.email.toLowerCase();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name: payload.name.trim() })
    .eq("id", payload.userId);

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  const { data: existing } = await supabase.from("athletes").select("id").eq("email", email).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("athletes")
      .update({
        name: payload.name.trim(),
        sport: payload.sport.trim(),
        phone: payload.phone?.trim() || null,
        details: payload.details,
        user_id: payload.userId,
      })
      .eq("email", email);
    if (error) return { success: false, message: error.message };
  } else {
    const { error } = await supabase.from("athletes").insert({
      user_id: payload.userId,
      name: payload.name.trim(),
      email,
      sport: payload.sport.trim(),
      phone: payload.phone?.trim() || null,
      details: payload.details,
      created_by: "self",
    });
    if (error) return { success: false, message: error.message };
  }

  return { success: true, message: "Profile saved." };
}

export async function listAthletes(): Promise<AthleteRecord[]> {
  const { data, error } = await supabase.from("athletes").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("listAthletes", error);
    return [];
  }
  return data ?? [];
}

export async function listCoaches(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "coach")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listCoaches", error);
    return [];
  }
  return data ?? [];
}

export async function listJournalEntries(athleteEmail?: string): Promise<JournalEntryRow[]> {
  let query = supabase.from("journal_entries").select("*").order("created_at", { ascending: false });
  if (athleteEmail) {
    query = query.eq("athlete_email", athleteEmail.toLowerCase());
  }
  const { data, error } = await query;
  if (error) {
    console.error("listJournalEntries", error);
    return [];
  }
  return data ?? [];
}

export async function uploadJournalMediaFiles(
  userId: string,
  files: Array<{ file: File; type: JournalMedia["type"] }>
): Promise<{ success: boolean; message: string; media: JournalMedia[] }> {
  const media: JournalMedia[] = [];

  for (const item of files) {
    const safeName = item.file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("journal-media").upload(path, item.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: item.file.type || undefined,
    });

    if (error) {
      return {
        success: false,
        message: `Upload failed for ${item.file.name}: ${error.message}. Run migration 008 if the storage bucket is missing.`,
        media,
      };
    }

    const { data } = supabase.storage.from("journal-media").getPublicUrl(path);
    media.push({
      id: `media-${Date.now()}-${media.length}`,
      type: item.type,
      name: item.file.name,
      url: data.publicUrl,
    });
  }

  return { success: true, message: "Media uploaded.", media };
}

export async function createJournalEntry(payload: {
  athleteEmail: string;
  athleteName: string;
  text: string;
  media: JournalMedia[];
}): Promise<AuthResult & { entry?: JournalEntryRow }> {
  const email = payload.athleteEmail.toLowerCase();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      athlete_id: athlete?.id ?? null,
      athlete_email: email,
      athlete_name: payload.athleteName,
      body: payload.text,
      media: payload.media,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Journal entry saved.", entry: data };
}

export async function updateJournalEntry(payload: {
  id: string;
  text: string;
}): Promise<AuthResult> {
  const { error } = await supabase
    .from("journal_entries")
    .update({ body: payload.text, updated_at: new Date().toISOString() })
    .eq("id", payload.id);

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: "Journal entry updated." };
}

export async function deleteJournalEntry(payload: { id: string }): Promise<AuthResult> {
  const { error } = await supabase.from("journal_entries").delete().eq("id", payload.id);
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: "Journal entry deleted." };
}

export function mapJournalRow(row: JournalEntryRow) {
  return {
    id: row.id,
    athleteEmail: row.athlete_email,
    athleteName: row.athlete_name,
    text: row.body,
    createdAt: new Date(row.created_at).toLocaleString(),
    media: row.media ?? [],
  };
}

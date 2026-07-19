// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useEffect, useState } from "react";
import { Edit3, Save, AlertCircle } from "lucide-react";
import type { AthleteDetails, AthleteRecord, Profile } from "../../../lib/database.types";
import { fetchAthleteByEmail, updateAthleteSelfProfile } from "../../../lib/api";

interface AthleteProfileProps {
  user: Profile;
  onProfileUpdated: (profile: Profile) => void;
}

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  sport: string;
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  position: string;
  injuries: string;
  goals: string;
  equipment: string;
  medicalNotes: string;
};

const emptyForm = (user: Profile, athlete?: AthleteRecord | null): ProfileForm => {
  const details = (athlete?.details ?? {}) as AthleteDetails;
  return {
    name: athlete?.name || user.name,
    email: user.email,
    phone: athlete?.phone || "",
    sport: athlete?.sport || "",
    age: details.age || "",
    height: details.height || "",
    weight: details.weight || "",
    bodyFat: details.bodyFat || "",
    position: details.position || "",
    injuries: details.injuries || "",
    goals: details.goals || "",
    equipment: details.equipment || "",
    medicalNotes: details.medicalNotes || "",
  };
};

function displayNameParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "Athlete", rest: "" };
  if (parts.length === 1) return { first: parts[0], rest: "" };
  return { first: parts[0], rest: parts.slice(1).join(" ") };
}

export function AthleteProfile({ user, onProfileUpdated }: AthleteProfileProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [form, setForm] = useState<ProfileForm>(() => emptyForm(user));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const athlete = await fetchAthleteByEmail(user.email);
      if (!mounted) return;
      setForm(emptyForm(user, athlete));
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const field = (label: string, key: keyof ProfileForm, multiline = false) => (
    <div key={key}>
      <label
        className="block text-muted-foreground mb-1.5 uppercase"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}
      >
        {label}
      </label>
      {editing ? (
        multiline ? (
          <textarea
            value={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            rows={3}
            className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/50 resize-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
          />
        ) : (
          <input
            value={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            disabled={key === "email"}
            className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-60"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
          />
        )
      ) : (
        <div
          className="text-foreground px-3 py-2.5 bg-muted border border-border min-h-[2.5rem]"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", lineHeight: 1.5 }}
        >
          {form[key] || "—"}
        </div>
      )}
    </div>
  );

  const handleEditToggle = async () => {
    if (!editing) {
      setFeedback(null);
      setEditing(true);
      return;
    }

    setSaving(true);
    setFeedback(null);
    const details: AthleteDetails = {
      age: form.age,
      height: form.height,
      weight: form.weight,
      bodyFat: form.bodyFat,
      position: form.position,
      injuries: form.injuries,
      goals: form.goals,
      equipment: form.equipment,
      medicalNotes: form.medicalNotes,
    };

    const result = await updateAthleteSelfProfile({
      userId: user.id,
      email: user.email,
      name: form.name,
      sport: form.sport || "General",
      phone: form.phone,
      details,
    });

    setSaving(false);
    setFeedback(result);
    if (!result.success) return;

    onProfileUpdated({ ...user, name: form.name.trim() });
    setEditing(false);
  };

  const { first, rest } = displayNameParts(form.name);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-muted-foreground uppercase mb-1"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}
          >
            ATHLETE PROFILE
          </div>
          <h1
            className="text-foreground uppercase"
            style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em" }}
          >
            {first}
            {rest ? (
              <>
                <br />
                <span className="text-primary">{rest}</span>
              </>
            ) : null}
          </h1>
        </div>
        <button
          onClick={handleEditToggle}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 border transition-all cursor-pointer uppercase disabled:opacity-60 ${
            editing
              ? "bg-primary border-primary text-white"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          }`}
          style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {editing ? (
            <>
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </>
          ) : (
            <>
              <Edit3 size={14} /> Edit Profile
            </>
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`border px-3 py-2 ${
            feedback.success
              ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10"
              : "border-destructive/30 text-destructive bg-destructive/10"
          }`}
          style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}
        >
          {feedback.message}
        </div>
      )}

      <div className="bg-card border border-border p-5">
        <h3
          className="text-foreground uppercase mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.06em" }}
        >
          Biometrics
        </h3>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {field("Age", "age")}
          {field("Height", "height")}
          {field("Weight", "weight")}
          {field("Body Fat", "bodyFat")}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {field("Sport / Discipline", "sport")}
          {field("Division / Category", "position")}
        </div>
      </div>

      <div className="bg-card border border-border p-5">
        <h3
          className="text-foreground uppercase mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.06em" }}
        >
          Contact
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {field("Full Name", "name")}
          {field("Email", "email")}
          {field("Phone", "phone")}
        </div>
      </div>

      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={15} className="text-[#ff8c42]" />
          <h3
            className="text-foreground uppercase"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.06em" }}
          >
            Medical & Health
          </h3>
        </div>
        <div className="space-y-4">
          {field("Injury History", "injuries", true)}
          {field("Medical Notes", "medicalNotes", true)}
        </div>
      </div>

      <div className="bg-card border border-border p-5">
        <h3
          className="text-foreground uppercase mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.06em" }}
        >
          Training Setup
        </h3>
        <div className="space-y-4">
          {field("Performance Goals", "goals", true)}
          {field("Available Equipment", "equipment", true)}
        </div>
      </div>
    </div>
  );
}

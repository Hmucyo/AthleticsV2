// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Edit3, Save, AlertCircle } from "lucide-react";

export function AthleteProfile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jordan Cole',
    age: '26',
    height: '6\'1"',
    weight: '195 lbs',
    bodyFat: '12%',
    sport: 'Powerlifting',
    position: 'Open',
    email: 'jordan.cole@example.com',
    phone: '+1 (555) 204-8811',
    injuries: 'Right shoulder impingement (2022) — fully cleared. Minor left knee strain (2024) — cleared.',
    goals: 'Hit 600 lb squat, 400 lb bench, 650 lb deadlift by Q4. Qualify for USAPL nationals.',
    equipment: 'Full commercial gym. Owns: belt, knee sleeves, wrist wraps, chalk.',
    medicalNotes: 'No current medications. Cleared for all activity by physician as of March 2025.',
  });

  const field = (label: string, key: keyof typeof profile, multiline = false) => (
    <div key={key}>
      <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{label}</label>
      {editing ? (
        multiline ? (
          <textarea
            value={profile[key]}
            onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
            rows={3}
            className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/50 resize-none"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
          />
        ) : (
          <input
            value={profile[key]}
            onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
            className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
          />
        )
      ) : (
        <div className="text-foreground px-3 py-2.5 bg-muted border border-border" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>{profile[key]}</div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>ATHLETE PROFILE</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            {profile.name.split(' ')[0]}<br /><span className="text-primary">{profile.name.split(' ')[1]}</span>
          </h1>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 px-4 py-2.5 border transition-all cursor-pointer uppercase ${editing ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit Profile</>}
        </button>
      </div>

      {/* Biometrics */}
      <div className="bg-card border border-border p-5">
        <h3 className="text-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em' }}>Biometrics</h3>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Age', 'age'],
            ['Height', 'height'],
            ['Weight', 'weight'],
            ['Body Fat', 'bodyFat'],
          ].map(([label, key]) => field(label, key as keyof typeof profile))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[['Sport / Discipline', 'sport'], ['Division / Category', 'position']].map(([label, key]) => field(label, key as keyof typeof profile))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card border border-border p-5">
        <h3 className="text-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em' }}>Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          {[['Email', 'email'], ['Phone', 'phone']].map(([label, key]) => field(label, key as keyof typeof profile))}
        </div>
      </div>

      {/* Medical & Goals */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={15} className="text-[#ff8c42]" />
          <h3 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em' }}>Medical & Health</h3>
        </div>
        <div className="space-y-4">
          {field('Injury History', 'injuries', true)}
          {field('Medical Notes', 'medicalNotes', true)}
        </div>
      </div>

      {/* Goals & Equipment */}
      <div className="bg-card border border-border p-5">
        <h3 className="text-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em' }}>Training Setup</h3>
        <div className="space-y-4">
          {field('Performance Goals', 'goals', true)}
          {field('Available Equipment', 'equipment', true)}
        </div>
      </div>
    </div>
  );
}

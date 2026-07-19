// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Mic, Image as ImageIcon, Plus, Pencil, Trash2, Save, X } from "lucide-react";

export interface JournalMedia {
  id: string;
  type: "audio" | "image" | "video";
  name: string;
  url: string;
}

export interface JournalEntry {
  id: string;
  athleteEmail: string;
  athleteName: string;
  text: string;
  createdAt: string;
  media: JournalMedia[];
}

interface CreateJournalResult {
  success: boolean;
  message: string;
}

interface AthleteJournalProps {
  athleteEmail: string;
  athleteName: string;
  entries: JournalEntry[];
  onCreateEntry: (payload: {
    athleteEmail: string;
    athleteName: string;
    text: string;
    mediaFiles: Array<{ file: File; type: JournalMedia["type"] }>;
  }) => CreateJournalResult | Promise<CreateJournalResult>;
  onUpdateEntry: (payload: { id: string; text: string }) => CreateJournalResult | Promise<CreateJournalResult>;
  onDeleteEntry: (payload: { id: string }) => CreateJournalResult | Promise<CreateJournalResult>;
}

const MAX_AUDIO_SIZE_MB = 10;
const MAX_MEDIA_SIZE_MB = 25;

export function AthleteJournal({ athleteEmail, athleteName, entries, onCreateEntry, onUpdateEntry, onDeleteEntry }: AthleteJournalProps) {
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [feedback, setFeedback] = useState<CreateJournalResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateFileSize = (file: File, maxMb: number) => file.size <= maxMb * 1024 * 1024;

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAudioFile(null);
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setFeedback({ success: false, message: "Voice recording must be an audio file." });
      return;
    }
    if (!validateFileSize(file, MAX_AUDIO_SIZE_MB)) {
      setFeedback({ success: false, message: `Audio file is too large. Max size is ${MAX_AUDIO_SIZE_MB}MB.` });
      return;
    }
    setAudioFile(file);
    setFeedback(null);
  };

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      setMediaFiles([]);
      return;
    }

    const invalidType = files.find((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    if (invalidType) {
      setFeedback({ success: false, message: "Media uploads must be image or video files." });
      return;
    }

    const oversized = files.find((file) => !validateFileSize(file, MAX_MEDIA_SIZE_MB));
    if (oversized) {
      setFeedback({ success: false, message: `Media files must each be ${MAX_MEDIA_SIZE_MB}MB or smaller.` });
      return;
    }

    setMediaFiles(files);
    setFeedback(null);
  };

  const submitEntry = async (event: FormEvent) => {
    event.preventDefault();
    const uploads: Array<{ file: File; type: JournalMedia["type"] }> = [];

    if (audioFile) {
      uploads.push({ file: audioFile, type: "audio" });
    }

    mediaFiles.forEach((file) => {
      const type = file.type.startsWith("video/") ? "video" : "image";
      uploads.push({ file, type });
    });

    if (!text.trim() && uploads.length === 0) {
      setFeedback({
        success: false,
        message: "Add text or at least one media file before saving.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const result = await onCreateEntry({
        athleteEmail,
        athleteName,
        text: text.trim(),
        mediaFiles: uploads,
      });

      setFeedback(result);
      if (!result.success) return;
      setText("");
      setAudioFile(null);
      setMediaFiles([]);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingText(entry.text);
    setFeedback(null);
  };

  const saveEdit = async () => {
    if (!editingEntryId) return;
    setIsSaving(true);
    try {
      const result = await onUpdateEntry({ id: editingEntryId, text: editingText });
      setFeedback(result);
      if (!result.success) return;
      setEditingEntryId(null);
      setEditingText("");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setEditingText("");
  };

  const deleteEntry = async (entryId: string) => {
    const result = await onDeleteEntry({ id: entryId });
    setFeedback(result);
    if (editingEntryId === entryId) cancelEdit();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
          Athlete Journal
        </div>
        <h1 className="text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em" }}>
          DAILY
          <br />
          <span className="text-primary">JOURNAL</span>
        </h1>
      </div>

      <form onSubmit={submitEntry} className="bg-card border border-border p-5 space-y-4">
        <h2 className="text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em" }}>
          Add Entry
        </h2>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write your training notes, recovery updates, or reflections..."
          className="w-full min-h-24 bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none resize-y"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", lineHeight: 1.5 }}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="border border-border bg-secondary/40 p-3 cursor-pointer hover:bg-secondary/70 transition-all">
            <div className="flex items-center gap-2 text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>
              <Mic size={14} /> Voice Recording
            </div>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioChange}
            />
            <div className="text-muted-foreground mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
              {audioFile ? audioFile.name : "Upload audio file"}
            </div>
          </label>
          <label className="border border-border bg-secondary/40 p-3 cursor-pointer hover:bg-secondary/70 transition-all">
            <div className="flex items-center gap-2 text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>
              <ImageIcon size={14} /> Images / Video
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaChange}
            />
            <div className="text-muted-foreground mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
              {mediaFiles.length ? `${mediaFiles.length} file(s) selected` : "Upload image or video"}
            </div>
          </label>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer uppercase inline-flex items-center gap-1.5 disabled:opacity-60"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          <Plus size={13} /> {isSaving ? "Saving..." : "Save Entry"}
        </button>
      </form>

      {feedback && (
        <div className={`border px-4 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`} style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
          {feedback.message}
        </div>
      )}

      <div className="bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em" }}>
            Your Entries
          </h2>
          <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
            {entries.length} total
          </span>
        </div>
        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
              No entries yet. Add your first journal update above.
            </div>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
                  {entry.createdAt}
                </div>
                <div className="flex gap-2">
                  {editingEntryId === entry.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="px-2.5 py-1 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 transition-all cursor-pointer uppercase inline-flex items-center gap-1"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em" }}
                      >
                        <Save size={11} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase inline-flex items-center gap-1"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em" }}
                      >
                        <X size={11} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(entry)}
                        className="px-2.5 py-1 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all cursor-pointer uppercase inline-flex items-center gap-1"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em" }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="px-2.5 py-1 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all cursor-pointer uppercase inline-flex items-center gap-1"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em" }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingEntryId === entry.id ? (
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="w-full min-h-20 bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none resize-y"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", lineHeight: 1.5 }}
                />
              ) : (
                entry.text && (
                <p className="text-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  {entry.text}
                </p>
                )
              )}
              {entry.media.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {entry.media.map((item) => (
                    <div key={item.id} className="border border-border bg-secondary/30 p-2">
                      <div className="text-muted-foreground mb-1 truncate" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem" }}>
                        {item.name}
                      </div>
                      {item.type === "image" && <img src={item.url} alt={item.name} className="w-full h-32 object-cover border border-border" />}
                      {item.type === "video" && <video src={item.url} controls className="w-full h-32 object-cover border border-border" />}
                      {item.type === "audio" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.06em" }}>
                            <Mic size={12} /> Voice Note
                          </div>
                          <audio src={item.url} controls className="w-full h-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

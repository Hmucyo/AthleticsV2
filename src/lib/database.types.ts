export type Role = "athlete" | "coach" | "admin";
export type AthleteCreatedBy = "admin" | "self";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  email: string;
  created_at?: string;
}

export interface AthleteDetails {
  age?: string;
  height?: string;
  weight?: string;
  bodyFat?: string;
  position?: string;
  injuries?: string;
  goals?: string;
  equipment?: string;
  medicalNotes?: string;
}

export interface AthleteRecord {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  sport: string;
  phone?: string | null;
  details?: AthleteDetails;
  created_by: AthleteCreatedBy;
  created_at?: string;
}

export interface JournalMedia {
  id: string;
  type: "audio" | "image" | "video";
  name: string;
  url: string;
}

export interface JournalEntryRow {
  id: string;
  athlete_id: string | null;
  athlete_email: string;
  athlete_name: string;
  body: string;
  media: JournalMedia[];
  created_at: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      athletes: {
        Row: AthleteRecord;
        Insert: Omit<AthleteRecord, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AthleteRecord>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: Omit<JournalEntryRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<JournalEntryRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_create_athlete_profile: {
        Args: { p_name: string; p_email: string; p_sport: string };
        Returns: AthleteRecord;
      };
    };
    Enums: {
      user_role: Role;
      athlete_created_by: AthleteCreatedBy;
    };
    CompositeTypes: Record<string, never>;
  };
}

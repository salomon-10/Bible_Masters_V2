/**
 * Types générés à la main à partir de supabase/migrations/0001_schema.sql.
 * En production, régénérer avec :
 *   supabase gen types typescript --project-id <id> > packages/shared/src/types/database.types.ts
 * (ce fichier respecte exactement la forme attendue par @supabase/postgrest-js :
 * chaque table déclare Row/Insert/Update/Relationships, et le schéma déclare
 * Tables/Views/Functions/Enums — nécessaire pour que le typage des jointures
 * `select("*, team1:teams!fkey(...)")` fonctionne correctement.)
 */

export type StaffRole = "admin" | "arbitre";
export type MatchStatus = "Programme" | "En cours" | "Termine";
export type MatchPhase = "Poule" | "Quart" | "Demi" | "PetiteFinale" | "Finale";

export interface Database {
  public: {
    Tables: {
      staff_roles: {
        Row: {
          user_id: string;
          username: string;
          role: StaffRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          role?: StaffRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff_roles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "staff_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tournaments: {
        Row: {
          id: number;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tournaments"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: number;
          tournament_id: number;
          name: string;
          logo_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          tournament_id: number;
          name: string;
          logo_path?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          }
        ];
      };
      pools: {
        Row: {
          id: number;
          tournament_id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          tournament_id: number;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pools"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "pools_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          }
        ];
      };
      pool_teams: {
        Row: {
          id: number;
          pool_id: number;
          team_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          pool_id: number;
          team_id: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pool_teams"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "pool_teams_pool_id_fkey";
            columns: ["pool_id"];
            isOneToOne: false;
            referencedRelation: "pools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pool_teams_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: true;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: number;
          tournament_id: number;
          team1_id: number;
          team2_id: number;
          match_date: string;
          match_time: string;
          status: MatchStatus;
          phase: MatchPhase;
          trial_template: string;
          score_team1: number | null;
          score_team2: number | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          tournament_id: number;
          team1_id: number;
          team2_id: number;
          match_date: string;
          match_time?: string;
          status?: MatchStatus;
          phase?: MatchPhase;
          trial_template?: string;
          score_team1?: number | null;
          score_team2?: number | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "matches_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team1_id_fkey";
            columns: ["team1_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team2_id_fkey";
            columns: ["team2_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      match_trials: {
        Row: {
          id: number;
          match_id: number;
          trial_order: number;
          trial_name: string;
          team1_points: number;
          team2_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          match_id: number;
          trial_order: number;
          trial_name: string;
          team1_points?: number;
          team2_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["match_trials"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "match_trials_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
      match_change_logs: {
        Row: {
          id: number;
          match_id: number;
          staff_user_id: string;
          staff_username: string;
          action: string;
          old_status: MatchStatus | null;
          new_status: MatchStatus | null;
          old_score_team1: number | null;
          new_score_team1: number | null;
          old_score_team2: number | null;
          new_score_team2: number | null;
          old_published: boolean | null;
          new_published: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          match_id: number;
          staff_user_id: string;
          staff_username: string;
          action?: string;
          old_status?: MatchStatus | null;
          new_status?: MatchStatus | null;
          old_score_team1?: number | null;
          new_score_team1?: number | null;
          old_score_team2?: number | null;
          new_score_team2?: number | null;
          old_published?: boolean | null;
          new_published?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["match_change_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "match_change_logs_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_staff_role: {
        Args: Record<string, never>;
        Returns: StaffRole | null;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      staff_role: StaffRole;
      match_status: MatchStatus;
      match_phase: MatchPhase;
    };
    CompositeTypes: Record<string, never>;
  };
}

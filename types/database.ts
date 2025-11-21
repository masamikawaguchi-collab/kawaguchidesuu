export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      negotiations: {
        Row: {
          id: string;
          title: string;
          client: string;
          date: string;
          description: string;
          amount: number;
          status: 'リード' | '初回接触' | '提案中' | '交渉中' | '受注' | '失注';
          next_action_date: string | null;
          next_action_detail: string | null;
          attachment_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          client: string;
          date: string;
          description: string;
          amount: number;
          status: 'リード' | '初回接触' | '提案中' | '交渉中' | '受注' | '失注';
          next_action_date?: string | null;
          next_action_detail?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          client?: string;
          date?: string;
          description?: string;
          amount?: number;
          status?: 'リード' | '初回接触' | '提案中' | '交渉中' | '受注' | '失注';
          next_action_date?: string | null;
          next_action_detail?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

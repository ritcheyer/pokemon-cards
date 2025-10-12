// Database types generated from Supabase schema
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
      users: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          avatar: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          avatar?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          avatar?: string | null;
        };
      };
      collection_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          quantity: number;
          condition: 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
          added_at: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          quantity?: number;
          condition: 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
          added_at?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          quantity?: number;
          condition?: 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
          added_at?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
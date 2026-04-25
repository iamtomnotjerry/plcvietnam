/**
 * Database Types
 *
 * This file will be auto-generated after linking to Supabase project.
 * Run: npx supabase gen types typescript --linked > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // Will be auto-generated
      [key: string]: any;
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      [key: string]: any;
    };
    Enums: {
      post_status: 'draft' | 'published' | 'archived';
      user_role: 'admin' | 'author' | 'reader';
    };
  };
}

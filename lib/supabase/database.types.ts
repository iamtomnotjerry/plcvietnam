export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      author_info: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          social_links: Json | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          social_links?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          social_links?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      books: {
        Row: {
          amazon_url: string | null;
          author: string | null;
          cover_url: string | null;
          created_at: string | null;
          description: string | null;
          download_count: number | null;
          download_url: string | null;
          field_id: string | null;
          id: string;
          isbn: string | null;
          published_year: number | null;
          publisher: string | null;
          slug: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          amazon_url?: string | null;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          download_count?: number | null;
          download_url?: string | null;
          field_id?: string | null;
          id?: string;
          isbn?: string | null;
          published_year?: number | null;
          publisher?: string | null;
          slug: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          amazon_url?: string | null;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          download_count?: number | null;
          download_url?: string | null;
          field_id?: string | null;
          id?: string;
          isbn?: string | null;
          published_year?: number | null;
          publisher?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'books_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'fields';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          field_id: string | null;
          id: string;
          name: string;
          post_count: number | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          field_id?: string | null;
          id?: string;
          name: string;
          post_count?: number | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          field_id?: string | null;
          id?: string;
          name?: string;
          post_count?: number | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'fields';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          author_avatar: string | null;
          author_email: string;
          author_name: string;
          content: string;
          created_at: string | null;
          id: string;
          is_approved: boolean | null;
          is_spam: boolean | null;
          parent_id: string | null;
          post_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          author_avatar?: string | null;
          author_email: string;
          author_name: string;
          content: string;
          created_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_spam?: boolean | null;
          parent_id?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          author_avatar?: string | null;
          author_email?: string;
          author_name?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_spam?: boolean | null;
          parent_id?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      fields: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          post_count: number | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          post_count?: number | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          post_count?: number | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      post_tags: {
        Row: {
          created_at: string | null;
          post_id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          post_id: string;
          tag_id: string;
        };
        Update: {
          created_at?: string | null;
          post_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_tags_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string | null;
          category_id: string | null;
          comment_count: number | null;
          content: string;
          created_at: string | null;
          excerpt: string | null;
          field_id: string | null;
          id: string;
          published_at: string | null;
          reading_time: number | null;
          seo_description: string | null;
          seo_keywords: string[] | null;
          seo_title: string | null;
          slug: string;
          status: Database['public']['Enums']['post_status'] | null;
          thumbnail_url: string | null;
          title: string;
          updated_at: string | null;
          view_count: number | null;
        };
        Insert: {
          author_id?: string | null;
          category_id?: string | null;
          comment_count?: number | null;
          content: string;
          created_at?: string | null;
          excerpt?: string | null;
          field_id?: string | null;
          id?: string;
          published_at?: string | null;
          reading_time?: number | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          seo_title?: string | null;
          slug: string;
          status?: Database['public']['Enums']['post_status'] | null;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Update: {
          author_id?: string | null;
          category_id?: string | null;
          comment_count?: number | null;
          content?: string;
          created_at?: string | null;
          excerpt?: string | null;
          field_id?: string | null;
          id?: string;
          published_at?: string | null;
          reading_time?: number | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database['public']['Enums']['post_status'] | null;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'fields';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          role: Database['public']['Enums']['user_role'] | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          role?: Database['public']['Enums']['user_role'] | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: Database['public']['Enums']['user_role'] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          post_count: number | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          post_count?: number | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          post_count?: number | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      post_status: 'draft' | 'published' | 'archived';
      user_role: 'admin' | 'author' | 'reader';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      post_status: ['draft', 'published', 'archived'],
      user_role: ['admin', 'author', 'reader'],
    },
  },
} as const;

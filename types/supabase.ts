export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null;
          created_at: string | null;
          criteria: Json;
          description: string;
          icon: string | null;
          id: number;
          is_active: boolean | null;
          name: string;
          points: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          criteria: Json;
          description: string;
          icon?: string | null;
          id?: number;
          is_active?: boolean | null;
          name: string;
          points?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          criteria?: Json;
          description?: string;
          icon?: string | null;
          id?: number;
          is_active?: boolean | null;
          name?: string;
          points?: number | null;
        };
        Relationships: [];
      };
      coaching_blocks: {
        Row: {
          created_at: string;
          focus: string | null;
          id: string;
          path_id: string;
          readiness_target: Json | null;
          week_index: number;
        };
        Insert: {
          created_at?: string;
          focus?: string | null;
          id?: string;
          path_id: string;
          readiness_target?: Json | null;
          week_index: number;
        };
        Update: {
          created_at?: string;
          focus?: string | null;
          id?: string;
          path_id?: string;
          readiness_target?: Json | null;
          week_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'coaching_blocks_path_id_fkey';
            columns: ['path_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_paths';
            referencedColumns: ['id'];
          },
        ];
      };
      coaching_events: {
        Row: {
          created_at: string;
          id: string;
          path_id: string;
          payload: Json | null;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          path_id: string;
          payload?: Json | null;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          path_id?: string;
          payload?: Json | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'coaching_events_path_id_fkey';
            columns: ['path_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_paths';
            referencedColumns: ['id'];
          },
        ];
      };
      coaching_paths: {
        Row: {
          created_at: string;
          current_week: number | null;
          goal_type: string;
          id: string;
          status: string;
          user_id: string;
          weeks: number;
        };
        Insert: {
          created_at?: string;
          current_week?: number | null;
          goal_type: string;
          id?: string;
          status?: string;
          user_id: string;
          weeks: number;
        };
        Update: {
          created_at?: string;
          current_week?: number | null;
          goal_type?: string;
          id?: string;
          status?: string;
          user_id?: string;
          weeks?: number;
        };
        Relationships: [];
      };
      coaching_sessions: {
        Row: {
          block_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          planned_duration: number | null;
          planned_load: Json | null;
          session_index: number;
          template_workout_id: number | null;
        };
        Insert: {
          block_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          planned_duration?: number | null;
          planned_load?: Json | null;
          session_index: number;
          template_workout_id?: number | null;
        };
        Update: {
          block_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          planned_duration?: number | null;
          planned_load?: Json | null;
          session_index?: number;
          template_workout_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'coaching_sessions_block_id_fkey';
            columns: ['block_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_blocks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coaching_sessions_template_workout_id_fkey';
            columns: ['template_workout_id'];
            isOneToOne: false;
            referencedRelation: 'workouts';
            referencedColumns: ['id'];
          },
        ];
      };
      exercise_sets: {
        Row: {
          completed: boolean | null;
          created_at: string | null;
          distance_meters: number | null;
          duration_seconds: number | null;
          id: number;
          reps: number | null;
          rest_seconds: number | null;
          rpe: number | null;
          session_exercise_id: number | null;
          set_number: number;
          weight_kg: number | null;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          id?: number;
          reps?: number | null;
          rest_seconds?: number | null;
          rpe?: number | null;
          session_exercise_id?: number | null;
          set_number: number;
          weight_kg?: number | null;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          id?: number;
          reps?: number | null;
          rest_seconds?: number | null;
          rpe?: number | null;
          session_exercise_id?: number | null;
          set_number?: number;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'exercise_sets_session_exercise_id_fkey';
            columns: ['session_exercise_id'];
            isOneToOne: false;
            referencedRelation: 'session_exercises';
            referencedColumns: ['id'];
          },
        ];
      };
      exercises: {
        Row: {
          created_at: string | null;
          demo_image_url: string | null;
          demo_video_url: string | null;
          description: string | null;
          difficulty_level: string | null;
          equipment: string[] | null;
          exercise_type: string | null;
          id: number;
          instructions: string | null;
          muscle_groups: string[];
          name: string;
        };
        Insert: {
          created_at?: string | null;
          demo_image_url?: string | null;
          demo_video_url?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          equipment?: string[] | null;
          exercise_type?: string | null;
          id?: number;
          instructions?: string | null;
          muscle_groups: string[];
          name: string;
        };
        Update: {
          created_at?: string | null;
          demo_image_url?: string | null;
          demo_video_url?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          equipment?: string[] | null;
          exercise_type?: string | null;
          id?: number;
          instructions?: string | null;
          muscle_groups?: string[];
          name?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          addressee_id: string | null;
          created_at: string | null;
          id: number;
          requester_id: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          addressee_id?: string | null;
          created_at?: string | null;
          id?: number;
          requester_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          addressee_id?: string | null;
          created_at?: string | null;
          id?: number;
          requester_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'friendships_addressee_id_fkey';
            columns: ['addressee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friendships_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      personal_records: {
        Row: {
          achieved_at: string | null;
          created_at: string | null;
          exercise_id: number | null;
          id: number;
          record_type: string;
          session_id: number | null;
          unit: string;
          user_id: string | null;
          value: number;
        };
        Insert: {
          achieved_at?: string | null;
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          record_type: string;
          session_id?: number | null;
          unit: string;
          user_id?: string | null;
          value: number;
        };
        Update: {
          achieved_at?: string | null;
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          record_type?: string;
          session_id?: number | null;
          unit?: string;
          user_id?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'personal_records_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personal_records_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'workout_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personal_records_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      post_comments: {
        Row: {
          content: string;
          created_at: string | null;
          id: number;
          post_id: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: number;
          post_id?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: number;
          post_id?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'social_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      post_likes: {
        Row: {
          created_at: string | null;
          id: number;
          post_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          post_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          post_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'social_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          fitness_level: string | null;
          full_name: string | null;
          height_cm: number | null;
          id: string;
          is_public: boolean | null;
          preferred_units: string | null;
          updated_at: string | null;
          username: string;
          weight_kg: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          fitness_level?: string | null;
          full_name?: string | null;
          height_cm?: number | null;
          id: string;
          is_public?: boolean | null;
          preferred_units?: string | null;
          updated_at?: string | null;
          username: string;
          weight_kg?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          fitness_level?: string | null;
          full_name?: string | null;
          height_cm?: number | null;
          id?: string;
          is_public?: boolean | null;
          preferred_units?: string | null;
          updated_at?: string | null;
          username?: string;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      session_exercises: {
        Row: {
          created_at: string | null;
          exercise_id: number | null;
          id: number;
          notes: string | null;
          order_index: number;
          session_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          notes?: string | null;
          order_index: number;
          session_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          notes?: string | null;
          order_index?: number;
          session_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'session_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_exercises_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'workout_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      social_posts: {
        Row: {
          achievement_id: number | null;
          coaching_path_id: string | null;
          content: string;
          created_at: string | null;
          id: number;
          is_public: boolean | null;
          media_urls: string[] | null;
          post_type: string | null;
          updated_at: string | null;
          user_id: string | null;
          workout_session_id: number | null;
        };
        Insert: {
          achievement_id?: number | null;
          coaching_path_id?: string | null;
          content: string;
          created_at?: string | null;
          id?: number;
          is_public?: boolean | null;
          media_urls?: string[] | null;
          post_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          workout_session_id?: number | null;
        };
        Update: {
          achievement_id?: number | null;
          coaching_path_id?: string | null;
          content?: string;
          created_at?: string | null;
          id?: number;
          is_public?: boolean | null;
          media_urls?: string[] | null;
          post_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          workout_session_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'social_posts_achievement_id_fkey';
            columns: ['achievement_id'];
            isOneToOne: false;
            referencedRelation: 'achievements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'social_posts_coaching_path_id_fkey';
            columns: ['coaching_path_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_paths';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'social_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'social_posts_workout_session_id_fkey';
            columns: ['workout_session_id'];
            isOneToOne: false;
            referencedRelation: 'workout_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      user_achievements: {
        Row: {
          achievement_id: number | null;
          id: number;
          progress: Json | null;
          unlocked_at: string | null;
          user_id: string | null;
        };
        Insert: {
          achievement_id?: number | null;
          id?: number;
          progress?: Json | null;
          unlocked_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          achievement_id?: number | null;
          id?: number;
          progress?: Json | null;
          unlocked_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey';
            columns: ['achievement_id'];
            isOneToOne: false;
            referencedRelation: 'achievements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_achievements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      workout_exercises: {
        Row: {
          created_at: string | null;
          exercise_id: number | null;
          id: number;
          notes: string | null;
          order_index: number;
          rest_seconds: number | null;
          target_duration_seconds: number | null;
          target_reps: number[] | null;
          target_sets: number | null;
          target_weight_kg: number | null;
          workout_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          notes?: string | null;
          order_index: number;
          rest_seconds?: number | null;
          target_duration_seconds?: number | null;
          target_reps?: number[] | null;
          target_sets?: number | null;
          target_weight_kg?: number | null;
          workout_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          exercise_id?: number | null;
          id?: number;
          notes?: string | null;
          order_index?: number;
          rest_seconds?: number | null;
          target_duration_seconds?: number | null;
          target_reps?: number[] | null;
          target_sets?: number | null;
          target_weight_kg?: number | null;
          workout_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workout_exercises_workout_id_fkey';
            columns: ['workout_id'];
            isOneToOne: false;
            referencedRelation: 'workouts';
            referencedColumns: ['id'];
          },
        ];
      };
      workout_sessions: {
        Row: {
          calories_burned: number | null;
          coaching_session_id: string | null;
          completed_at: string | null;
          created_at: string | null;
          duration_minutes: number | null;
          id: number;
          name: string;
          notes: string | null;
          rating: number | null;
          started_at: string | null;
          user_id: string | null;
          workout_id: number | null;
        };
        Insert: {
          calories_burned?: number | null;
          coaching_session_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: number;
          name: string;
          notes?: string | null;
          rating?: number | null;
          started_at?: string | null;
          user_id?: string | null;
          workout_id?: number | null;
        };
        Update: {
          calories_burned?: number | null;
          coaching_session_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: number;
          name?: string;
          notes?: string | null;
          rating?: number | null;
          started_at?: string | null;
          user_id?: string | null;
          workout_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_coaching_session_id_fkey';
            columns: ['coaching_session_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workout_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workout_sessions_workout_id_fkey';
            columns: ['workout_id'];
            isOneToOne: false;
            referencedRelation: 'workouts';
            referencedColumns: ['id'];
          },
        ];
      };
      workout_streaks: {
        Row: {
          current_streak: number | null;
          id: number;
          last_workout_date: string | null;
          longest_streak: number | null;
          streak_start_date: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          current_streak?: number | null;
          id?: number;
          last_workout_date?: string | null;
          longest_streak?: number | null;
          streak_start_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          current_streak?: number | null;
          id?: number;
          last_workout_date?: string | null;
          longest_streak?: number | null;
          streak_start_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_streaks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      workouts: {
        Row: {
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          difficulty_level: string | null;
          estimated_duration_minutes: number | null;
          id: number;
          is_public: boolean | null;
          is_template: boolean | null;
          name: string;
          updated_at: string | null;
          workout_type: string | null;
        };
        Insert: {
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_minutes?: number | null;
          id?: number;
          is_public?: boolean | null;
          is_template?: boolean | null;
          name: string;
          updated_at?: string | null;
          workout_type?: string | null;
        };
        Update: {
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_minutes?: number | null;
          id?: number;
          is_public?: boolean | null;
          is_template?: boolean | null;
          name?: string;
          updated_at?: string | null;
          workout_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workouts_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_coaching_path: {
        Args: { baseline_metrics: Json; goal_type: string; weeks: number };
        Returns: string;
      };
      get_coach_notes: {
        Args: { p_path_id: string; p_session_id: string };
        Returns: Json;
      };
      recalculate_path: { Args: { p_path_id: string }; Returns: undefined };
      update_workout_streak: { Args: { user_uuid: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
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
    Enums: {},
  },
} as const;

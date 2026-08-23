export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aisles: {
        Row: {
          display_order: number
          id: string
          name: string
        }
        Insert: {
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      cooking_tips: {
        Row: {
          content: string
          created_at: string
          id: string
          tip_type: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tip_type: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tip_type?: string
          title?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          calories_per_100g: number | null
          created_at: string
          default_unit: string | null
          id: string
          name: string
          protein_per_100g_g: number | null
          user_id: string
        }
        Insert: {
          calories_per_100g?: number | null
          created_at?: string
          default_unit?: string | null
          id?: string
          name: string
          protein_per_100g_g?: number | null
          user_id?: string
        }
        Update: {
          calories_per_100g?: number | null
          created_at?: string
          default_unit?: string | null
          id?: string
          name?: string
          protein_per_100g_g?: number | null
          user_id?: string
        }
        Relationships: []
      }
      meal_plan_entries: {
        Row: {
          created_at: string
          free_text_meal: string | null
          id: string
          meal_date: string
          meal_type: string
          recipe_id: string | null
          servings: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          free_text_meal?: string | null
          id?: string
          meal_date: string
          meal_type: string
          recipe_id?: string | null
          servings?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          free_text_meal?: string | null
          id?: string
          meal_date?: string
          meal_type?: string
          recipe_id?: string | null
          servings?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "v_recipe_nutrition"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "meal_plan_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          created_at: string
          emoji: string | null
          expiration_date: string | null
          id: string
          ingredient_id: string
          quantity: number
          storage_location: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          expiration_date?: string | null
          id?: string
          ingredient_id: string
          quantity: number
          storage_location?: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          expiration_date?: string | null
          id?: string
          ingredient_id?: string
          quantity?: number
          storage_location?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          daily_calories_target: number | null
          daily_protein_target_g: number | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_calories_target?: number | null
          daily_protein_target_g?: number | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_calories_target?: number | null
          daily_protein_target_g?: number | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          ingredient_id: string
          quantity: number
          quantity_grams_equivalent: number | null
          recipe_id: string
          unit: string
          user_id: string
        }
        Insert: {
          ingredient_id: string
          quantity: number
          quantity_grams_equivalent?: number | null
          recipe_id: string
          unit: string
          user_id?: string
        }
        Update: {
          ingredient_id?: string
          quantity?: number
          quantity_grams_equivalent?: number | null
          recipe_id?: string
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "v_recipe_nutrition"
            referencedColumns: ["recipe_id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          recipe_id: string
          tag_id: string
        }
        Insert: {
          recipe_id: string
          tag_id: string
        }
        Update: {
          recipe_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "v_recipe_nutrition"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          instructions: string
          photo_url: string | null
          prep_time_minutes: number | null
          servings: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          id?: string
          instructions: string
          photo_url?: string | null
          prep_time_minutes?: number | null
          servings?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          instructions?: string
          photo_url?: string | null
          prep_time_minutes?: number | null
          servings?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_produce: {
        Row: {
          created_at: string
          harvest_months: number[] | null
          id: string
          name: string
          produce_type: string
          selection_tips: string | null
          storage_conditions: string | null
          storage_duration_days: number | null
        }
        Insert: {
          created_at?: string
          harvest_months?: number[] | null
          id?: string
          name: string
          produce_type: string
          selection_tips?: string | null
          storage_conditions?: string | null
          storage_duration_days?: number | null
        }
        Update: {
          created_at?: string
          harvest_months?: number[] | null
          id?: string
          name?: string
          produce_type?: string
          selection_tips?: string | null
          storage_conditions?: string | null
          storage_duration_days?: number | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          aisle_id: string | null
          created_at: string
          custom_name: string | null
          id: string
          ingredient_id: string | null
          is_checked: boolean
          meal_plan_entry_id: string | null
          quantity: number | null
          source: string
          unit: string | null
          user_id: string
        }
        Insert: {
          aisle_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          ingredient_id?: string | null
          is_checked?: boolean
          meal_plan_entry_id?: string | null
          quantity?: number | null
          source?: string
          unit?: string | null
          user_id: string
        }
        Update: {
          aisle_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          ingredient_id?: string | null
          is_checked?: boolean
          meal_plan_entry_id?: string | null
          quantity?: number | null
          source?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_aisle_id_fkey"
            columns: ["aisle_id"]
            isOneToOne: false
            referencedRelation: "aisles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_meal_plan_entry_id_fkey"
            columns: ["meal_plan_entry_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_recipe_nutrition: {
        Row: {
          calories_per_serving: number | null
          protein_per_serving_g: number | null
          recipe_id: string | null
          servings: number | null
          title: string | null
          total_calories: number | null
          total_protein_g: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

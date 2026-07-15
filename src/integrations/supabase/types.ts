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
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      client_ledger: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          entry_date: string
          entry_type: string
          id: string
          method: string | null
          note: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          entry_date?: string
          entry_type: string
          id?: string
          method?: string | null
          note?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          method?: string | null
          note?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_ledger_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cnic: string | null
          created_at: string
          current_balance: number
          email: string | null
          id: string
          name: string
          notes: string | null
          opening_balance: number
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnic?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          opening_balance?: number
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnic?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          opening_balance?: number
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_purchases: {
        Row: {
          cost_price: number | null
          created_at: string
          customer_id: string | null
          customer_name: string
          id: string
          payment_due_date: string | null
          payment_method: string
          payment_status: string
          product_id: string | null
          purchase_date: string
          quantity_purchased: number
          total_price: number
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          id?: string
          payment_due_date?: string | null
          payment_method: string
          payment_status?: string
          product_id?: string | null
          purchase_date?: string
          quantity_purchased: number
          total_price: number
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          payment_due_date?: string | null
          payment_method?: string
          payment_status?: string
          product_id?: string | null
          purchase_date?: string
          quantity_purchased?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          cnic: string | null
          created_at: string
          email: string | null
          id: string
          joining_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          salary: number
          status: string
          updated_at: string
        }
        Insert: {
          cnic?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joining_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          salary?: number
          status?: string
          updated_at?: string
        }
        Update: {
          cnic?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          salary?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date_of_expense: string
          expense_type: string
          id: string
          notes: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date_of_expense?: string
          expense_type: string
          id?: string
          notes?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date_of_expense?: string
          expense_type?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          cost_price: number | null
          id: string
          invoice_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          cost_price?: number | null
          id?: string
          invoice_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          cost_price?: number | null
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          due_date: string | null
          id: string
          invoice_id: string
          payment_method: string
          payment_status: string
          total_amount: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          due_date?: string | null
          id?: string
          invoice_id: string
          payment_method: string
          payment_status?: string
          total_amount: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          due_date?: string | null
          id?: string
          invoice_id?: string
          payment_method?: string
          payment_status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          note: string | null
          payment_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          note?: string | null
          payment_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string | null
          payment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_ledger: {
        Row: {
          amount: number
          created_at: string
          entry_date: string
          entry_type: string
          id: string
          merchant_id: string
          method: string | null
          note: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          entry_date?: string
          entry_type: string
          id?: string
          merchant_id: string
          method?: string | null
          note?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          merchant_id?: string
          method?: string | null
          note?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_ledger_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          cnic: string | null
          created_at: string
          current_balance: number
          email: string | null
          id: string
          name: string
          notes: string | null
          opening_balance: number
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnic?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          opening_balance?: number
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnic?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          opening_balance?: number
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string
          deal_end_date: string | null
          description: string | null
          id: string
          image_url: string | null
          is_deal: boolean
          is_featured: boolean
          last_purchase_date: string | null
          product_name: string
          purchase_price: number
          quantity_in_stock: number
          selling_price: number
          subcategory_id: string | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          deal_end_date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_deal?: boolean
          is_featured?: boolean
          last_purchase_date?: string | null
          product_name: string
          purchase_price?: number
          quantity_in_stock?: number
          selling_price?: number
          subcategory_id?: string | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          deal_end_date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_deal?: boolean
          is_featured?: boolean
          last_purchase_date?: string | null
          product_name?: string
          purchase_price?: number
          quantity_in_stock?: number
          selling_price?: number
          subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      reports_inbox: {
        Row: {
          created_at: string
          from_email: string | null
          from_name: string
          from_phone: string | null
          id: string
          message: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email?: string | null
          from_name: string
          from_phone?: string | null
          id?: string
          message: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string | null
          from_name?: string
          from_phone?: string | null
          id?: string
          message?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_purchases: {
        Row: {
          created_at: string
          date: string
          id: string
          product_id: string | null
          purchase_price: number
          quantity: number
          supplier_name: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          product_id?: string | null
          purchase_price: number
          quantity: number
          supplier_name: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          product_id?: string | null
          purchase_price?: number
          quantity?: number
          supplier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category_id: string | null
          created_at: string
          default_price: number
          description: string | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          customer_name: string
          id: string
          message: string
          rating: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          customer_name: string
          id?: string
          message: string
          rating?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          message?: string
          rating?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_ledger_delta: {
        Args: { _amount: number; _type: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      merchant_ledger_delta: {
        Args: { _amount: number; _type: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const

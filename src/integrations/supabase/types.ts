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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      ledger: {
        Row: {
          account: string
          created_at: string
          credit_sar: number
          debit_sar: number
          id: string
          memo: string | null
          ref: string | null
        }
        Insert: {
          account: string
          created_at?: string
          credit_sar?: number
          debit_sar?: number
          id?: string
          memo?: string | null
          ref?: string | null
        }
        Update: {
          account?: string
          created_at?: string
          credit_sar?: number
          debit_sar?: number
          id?: string
          memo?: string | null
          ref?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          amount_mismatch: boolean | null
          confirmed_by: string | null
          created_at: string
          customer_name: string
          discount_sar: number
          display_currency: string
          extraction_status: string
          id: string
          items: Json
          order_number: string
          paid_at: string | null
          payment_method: string
          phone: string
          receipt_amount: number | null
          receipt_currency: string | null
          receipt_notes: string | null
          receipt_path: string | null
          receipt_reference: string | null
          receipt_wallet: string | null
          shipping_sar: number
          status: string
          subtotal_sar: number
          total_sar: number
          total_yer: number
          wallet: string | null
          zone: string
        }
        Insert: {
          address: string
          amount_mismatch?: boolean | null
          confirmed_by?: string | null
          created_at?: string
          customer_name: string
          discount_sar?: number
          display_currency?: string
          extraction_status?: string
          id?: string
          items: Json
          order_number: string
          paid_at?: string | null
          payment_method: string
          phone: string
          receipt_amount?: number | null
          receipt_currency?: string | null
          receipt_notes?: string | null
          receipt_path?: string | null
          receipt_reference?: string | null
          receipt_wallet?: string | null
          shipping_sar?: number
          status?: string
          subtotal_sar: number
          total_sar: number
          total_yer: number
          wallet?: string | null
          zone: string
        }
        Update: {
          address?: string
          amount_mismatch?: boolean | null
          confirmed_by?: string | null
          created_at?: string
          customer_name?: string
          discount_sar?: number
          display_currency?: string
          extraction_status?: string
          id?: string
          items?: Json
          order_number?: string
          paid_at?: string | null
          payment_method?: string
          phone?: string
          receipt_amount?: number | null
          receipt_currency?: string | null
          receipt_notes?: string | null
          receipt_path?: string | null
          receipt_reference?: string | null
          receipt_wallet?: string | null
          shipping_sar?: number
          status?: string
          subtotal_sar?: number
          total_sar?: number
          total_yer?: number
          wallet?: string | null
          zone?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_sar: number
          created_at: string
          id: string
          memo: string | null
          party_id: string
          party_type: string
        }
        Insert: {
          amount_sar: number
          created_at?: string
          id?: string
          memo?: string | null
          party_id: string
          party_type: string
        }
        Update: {
          amount_sar?: number
          created_at?: string
          id?: string
          memo?: string | null
          party_id?: string
          party_type?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          color: string
          created_at: string
          id: string
          path: string
          product_id: string
          sort: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          path: string
          product_id: string
          sort?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          path?: string
          product_id?: string
          sort?: number
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          paid_sar: number
          product_id: string
          qty: number
          supplier_id: string
          total_sar: number | null
          unit_cost_sar: number
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paid_sar?: number
          product_id: string
          qty: number
          supplier_id: string
          total_sar?: number | null
          unit_cost_sar: number
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paid_sar?: number
          product_id?: string
          qty?: number
          supplier_id?: string
          total_sar?: number | null
          unit_cost_sar?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          channel: string
          created_at: string
          customer_id: string | null
          id: string
          paid_sar: number
          product_id: string
          qty: number
          total_sar: number | null
          unit_cost_sar: number
          unit_price_sar: number
          warehouse_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          paid_sar?: number
          product_id: string
          qty: number
          total_sar?: number | null
          unit_cost_sar?: number
          unit_price_sar: number
          warehouse_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          paid_sar?: number
          product_id?: string
          qty?: number
          total_sar?: number | null
          unit_cost_sar?: number
          unit_price_sar?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          barcode: string | null
          product_id: string
          qty: number
          warehouse_id: string
        }
        Insert: {
          barcode?: string | null
          product_id: string
          qty?: number
          warehouse_id: string
        }
        Update: {
          barcode?: string | null
          product_id?: string
          qty?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          product_id: string
          qty_change: number
          reason: string
          ref: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          qty_change: number
          reason: string
          ref?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          qty_change?: number
          reason?: string
          ref?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          id: number
          updated_at: string
          updated_by: string | null
          wallets: Json
          yer_per_sar: number
          yer_per_usd: number
          zones: Json
        }
        Insert: {
          id?: number
          updated_at?: string
          updated_by?: string | null
          wallets?: Json
          yer_per_sar?: number
          yer_per_usd?: number
          zones?: Json
        }
        Update: {
          id?: number
          updated_at?: string
          updated_by?: string | null
          wallets?: Json
          yer_per_sar?: number
          yer_per_usd?: number
          zones?: Json
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
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
      warehouses: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      erp_move_stock: {
        Args: {
          _delta: number
          _product: string
          _reason: string
          _ref: string
          _wh: string
        }
        Returns: undefined
      }
      erp_stocktake: {
        Args: { _counted: number; _product: string; _wh: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const

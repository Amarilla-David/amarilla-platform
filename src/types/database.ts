export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: "admin" | "manager" | "employee" | "client"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: "admin" | "manager" | "employee" | "client"
          avatar_url?: string | null
        }
        Update: {
          full_name?: string
          role?: "admin" | "manager" | "employee" | "client"
          avatar_url?: string | null
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          resource: string
          project_id: string | null
          access_level: "read" | "write" | "admin"
          granted_by: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          resource: string
          project_id?: string | null
          access_level?: "read" | "write" | "admin"
          granted_by?: string | null
        }
        Update: {
          resource?: string
          project_id?: string | null
          access_level?: "read" | "write" | "admin"
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          client_name: string | null
          airtable_base_id: string | null
          status: "active" | "completed" | "archived"
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          client_name?: string | null
          airtable_base_id?: string | null
          status?: "active" | "completed" | "archived"
        }
        Update: {
          name?: string
          client_name?: string | null
          airtable_base_id?: string | null
          status?: "active" | "completed" | "archived"
        }
      }
    }
  }
}

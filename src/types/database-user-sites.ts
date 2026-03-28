// Tipos TypeScript para la tabla user_sites
// Este archivo debe ser integrado en database.ts después de ejecutar la migración en Supabase
// y regenerar los tipos con: npx supabase gen types typescript --project-id hdnpkmnrnfkiuadpbeac > src/types/database.ts

export interface UserSiteThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
  banner: string | null;
  fontFamily: string;
}

export interface UserSiteSeoConfig {
  title: string | null;
  description: string | null;
  keywords: string[];
}

export interface UserSiteRow {
  id: string;
  user_id_supabase: string;
  site_name: string;
  custom_domain: string | null;
  subdomain: string | null;
  cbf_api_key: string;
  is_active: boolean;
  theme_config: unknown;
  seo_config: unknown;
  created_at: string;
  updated_at: string;
  domain_verified: boolean;
}

export interface UserSiteInsert {
  id?: string;
  user_id_supabase: string;
  site_name: string;
  custom_domain?: string | null;
  domain_verified?: boolean;
  subdomain?: string | null;
  cbf_api_key: string;
  is_active?: boolean;
  theme_config?: unknown;
  seo_config?: unknown;
  created_at?: string;
  updated_at?: string;
}

export interface UserSiteUpdate {
  id?: string;
  user_id_supabase?: string;
  site_name?: string;
  custom_domain?: string | null;
  domain_verified?: boolean;
  subdomain?: string | null;
  cbf_api_key?: string;
  is_active?: boolean;
  theme_config?: unknown;
  seo_config?: unknown;
  created_at?: string;
  updated_at?: string;
}

// Este tipo debe agregarse a Database["public"]["Tables"] en database.ts
export interface UserSitesTable {
  Row: UserSiteRow;
  Insert: UserSiteInsert;
  Update: UserSiteUpdate;
  Relationships: [
    {
      foreignKeyName: "user_sites_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: true;
      referencedRelation: "usuarios";
      referencedColumns: ["id"];
    }
  ];
}

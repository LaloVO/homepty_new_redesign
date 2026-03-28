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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accionespropiedades: {
        Row: {
          created_at: string
          id_accion_propiedad: number
          nombre_accion_propiedad: string
        }
        Insert: {
          created_at?: string
          id_accion_propiedad?: number
          nombre_accion_propiedad: string
        }
        Update: {
          created_at?: string
          id_accion_propiedad?: number
          nombre_accion_propiedad?: string
        }
        Relationships: []
      }
      actividad_usuario: {
        Row: {
          created_at: string | null
          entidad_id: string | null
          entidad_tipo: string | null
          id: number
          metadata: Json | null
          modulo: string
          tipo_actividad: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          id?: number
          metadata?: Json | null
          modulo: string
          tipo_actividad: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          id?: number
          metadata?: Json | null
          modulo?: string
          tipo_actividad?: string
          usuario_id?: string
        }
        Relationships: []
      }
      amenidades: {
        Row: {
          created_at: string
          id_amenidad: number
          nombre_amenidad: string
        }
        Insert: {
          created_at?: string
          id_amenidad?: number
          nombre_amenidad: string
        }
        Update: {
          created_at?: string
          id_amenidad?: number
          nombre_amenidad?: string
        }
        Relationships: []
      }
      amenidades_propiedades: {
        Row: {
          created_at: string
          id: number
          id_amenidad: number
          id_propiedad: number
        }
        Insert: {
          created_at?: string
          id?: number
          id_amenidad: number
          id_propiedad: number
        }
        Update: {
          created_at?: string
          id?: number
          id_amenidad?: number
          id_propiedad?: number
        }
        Relationships: [
          {
            foreignKeyName: "amenidades_unidades_id_amenidad_fkey"
            columns: ["id_amenidad"]
            isOneToOne: false
            referencedRelation: "amenidades"
            referencedColumns: ["id_amenidad"]
          },
          {
            foreignKeyName: "amenidades_unidades_id_propiedad_fkey"
            columns: ["id_propiedad"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      ciudades: {
        Row: {
          created_at: string
          id_ciudad: number
          id_estado: number
          nombre_ciudad: string
        }
        Insert: {
          created_at?: string
          id_ciudad?: number
          id_estado: number
          nombre_ciudad: string
        }
        Update: {
          created_at?: string
          id_ciudad?: number
          id_estado?: number
          nombre_ciudad?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciudades_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id_estado"]
          },
        ]
      }
      clientes: {
        Row: {
          accion: string | null
          cantidad_banios: number | null
          cantidad_estacionamientos: number | null
          cantidad_habitaciones: number | null
          created_at: string
          dni_cif_cliente: string
          email_cliente: string
          id_cliente: number
          id_usuario: string
          nombre_cliente: string
          nota_cliente: string | null
          presupuesto_desde_cliente: number | null
          presupuesto_hasta_cliente: number | null
          telefono_cliente: string
          tipo_propiedad: Database["public"]["Enums"]["tipo_propiedad"] | null
          updated_at: string
        }
        Insert: {
          accion?: string | null
          cantidad_banios?: number | null
          cantidad_estacionamientos?: number | null
          cantidad_habitaciones?: number | null
          created_at?: string
          dni_cif_cliente: string
          email_cliente: string
          id_cliente?: number
          id_usuario?: string
          nombre_cliente: string
          nota_cliente?: string | null
          presupuesto_desde_cliente?: number | null
          presupuesto_hasta_cliente?: number | null
          telefono_cliente: string
          tipo_propiedad?: Database["public"]["Enums"]["tipo_propiedad"] | null
          updated_at?: string
        }
        Update: {
          accion?: string | null
          cantidad_banios?: number | null
          cantidad_estacionamientos?: number | null
          cantidad_habitaciones?: number | null
          created_at?: string
          dni_cif_cliente?: string
          email_cliente?: string
          id_cliente?: number
          id_usuario?: string
          nombre_cliente?: string
          nota_cliente?: string | null
          presupuesto_desde_cliente?: number | null
          presupuesto_hasta_cliente?: number | null
          telefono_cliente?: string
          tipo_propiedad?: Database["public"]["Enums"]["tipo_propiedad"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      colonias: {
        Row: {
          created_at: string
          id_colonia: number
          id_zona: number | null
          nombre_colonia: string
        }
        Insert: {
          created_at?: string
          id_colonia?: number
          id_zona?: number | null
          nombre_colonia: string
        }
        Update: {
          created_at?: string
          id_colonia?: number
          id_zona?: number | null
          nombre_colonia?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string
          id: string
          id_usuario: string
          is_private: boolean
          name: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description: string
          id?: string
          id_usuario?: string
          is_private?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string
          id?: string
          id_usuario?: string
          is_private?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          instructor_avatar: string | null
          instructor_name: string
          is_published: boolean
          keywords: string | null
          level: string
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor_avatar?: string | null
          instructor_name: string
          is_published?: boolean
          keywords?: string | null
          level: string
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor_avatar?: string | null
          instructor_name?: string
          is_published?: boolean
          keywords?: string | null
          level?: string
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      easybroker_integrations: {
        Row: {
          api_key: string
          created_at: string
          error_message: string | null
          id: string
          id_usuario: string
          is_active: boolean
          last_sync_at: string | null
          last_sync_status: string | null
          properties_synced_count: number | null
          sync_frequency_hours: number | null
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          error_message?: string | null
          id?: string
          id_usuario: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string | null
          properties_synced_count?: number | null
          sync_frequency_hours?: number | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          error_message?: string | null
          id?: string
          id_usuario?: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string | null
          properties_synced_count?: number | null
          sync_frequency_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "easybroker_integrations_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      easybroker_sync_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          id: string
          integration_id: string
          properties_added: number | null
          properties_failed: number | null
          properties_updated: number | null
          status: string | null
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          id?: string
          integration_id: string
          properties_added?: number | null
          properties_failed?: number | null
          properties_updated?: number | null
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          id?: string
          integration_id?: string
          properties_added?: number | null
          properties_failed?: number | null
          properties_updated?: number | null
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "easybroker_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "easybroker_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      estados: {
        Row: {
          created_at: string
          id_estado: number
          id_pais: number
          nombre_estado: string
        }
        Insert: {
          created_at?: string
          id_estado?: number
          id_pais: number
          nombre_estado: string
        }
        Update: {
          created_at?: string
          id_estado?: number
          id_pais?: number
          nombre_estado?: string
        }
        Relationships: [
          {
            foreignKeyName: "estados_id_pais_fkey"
            columns: ["id_pais"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id_pais"]
          },
        ]
      }
      imagenes_propiedades: {
        Row: {
          created_at: string
          id: number
          id_propiedad: number
          image_url: string
        }
        Insert: {
          created_at?: string
          id?: number
          id_propiedad: number
          image_url: string
        }
        Update: {
          created_at?: string
          id?: number
          id_propiedad?: number
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imagenes_desarrollos_id_propiedad_fkey"
            columns: ["id_propiedad"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      inquilinos: {
        Row: {
          created_at: string
          dni_cif: string | null
          email: string | null
          estado: boolean
          id: number
          id_usuario: string
          nombre: string
          ocupacion: string | null
          phone_number: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dni_cif?: string | null
          email?: string | null
          estado?: boolean
          id?: number
          id_usuario: string
          nombre: string
          ocupacion?: string | null
          phone_number?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dni_cif?: string | null
          email?: string | null
          estado?: boolean
          id?: number
          id_usuario?: string
          nombre?: string
          ocupacion?: string | null
          phone_number?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquilinos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          action: string
          contacto: string | null
          created_at: string
          id: number
          max_price: number | null
          min_price: number | null
          nivel_urgencia: string
          notas_adicionales: string | null
          status: Database["public"]["Enums"]["offer_status"]
          tipo_propiedad: string
          ubicaciones: string
          user_id: string | null
        }
        Insert: {
          action: string
          contacto?: string | null
          created_at?: string
          id?: number
          max_price?: number | null
          min_price?: number | null
          nivel_urgencia: string
          notas_adicionales?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          tipo_propiedad: string
          ubicaciones: string
          user_id?: string | null
        }
        Update: {
          action?: string
          contacto?: string | null
          created_at?: string
          id?: number
          max_price?: number | null
          min_price?: number | null
          nivel_urgencia?: string
          notas_adicionales?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          tipo_propiedad?: string
          ubicaciones?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      paises: {
        Row: {
          created_at: string
          id_pais: number
          nombre_pais: string
        }
        Insert: {
          created_at?: string
          id_pais?: number
          nombre_pais: string
        }
        Update: {
          created_at?: string
          id_pais?: number
          nombre_pais?: string
        }
        Relationships: []
      }
      property_attribute_values: {
        Row: {
          attribute_id: number
          created_at: string
          id: number
          property_id: string
          updated_at: string
          valor_booleano: boolean | null
          valor_numerico: number | null
          valor_texto: string | null
        }
        Insert: {
          attribute_id: number
          created_at?: string
          id?: number
          property_id: string
          updated_at?: string
          valor_booleano?: boolean | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Update: {
          attribute_id?: number
          created_at?: string
          id?: number
          property_id?: string
          updated_at?: string
          valor_booleano?: boolean | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_attribute_values_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "tax_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      property_taxonomy: {
        Row: {
          created_at: string
          id: number
          property_id: string
          segment_id: number | null
          subsegment_id: number | null
          tipologia_id: number | null
          updated_at: string
          vertical_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          property_id: string
          segment_id?: number | null
          subsegment_id?: number | null
          tipologia_id?: number | null
          updated_at?: string
          vertical_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          property_id?: string
          segment_id?: number | null
          subsegment_id?: number | null
          tipologia_id?: number | null
          updated_at?: string
          vertical_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_taxonomy_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "tax_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_taxonomy_subsegment_id_fkey"
            columns: ["subsegment_id"]
            isOneToOne: false
            referencedRelation: "tax_subsegments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_taxonomy_tipologia_id_fkey"
            columns: ["tipologia_id"]
            isOneToOne: false
            referencedRelation: "tax_tipologias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_taxonomy_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "tax_verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          area: number
          area_construida: number
          banios: number
          caracteristicas: string | null
          codigo_postal: string | null
          colonia: string | null
          created_at: string
          descripcion: string
          descripcion_estado: string
          descripcion_inversion: string | null
          direccion: string
          easybroker_features: Json | null
          easybroker_id: string | null
          easybroker_images_json: Json | null
          easybroker_source_data: Json | null
          estacionamientos: number
          habitaciones: number
          id: number
          id_ciudad: number
          id_estado: number
          id_tipo_accion: number
          id_tipo_uso: number
          id_usuario: string
          is_unit: boolean
          nombre: string
          parent_id: number | null
          precio: number
          tipo: Database["public"]["Enums"]["tipo_propiedad"]
          updated_at: string | null
        }
        Insert: {
          area: number
          area_construida?: number
          banios?: number
          caracteristicas?: string | null
          codigo_postal?: string | null
          colonia?: string | null
          created_at?: string
          descripcion: string
          descripcion_estado: string
          descripcion_inversion?: string | null
          direccion: string
          easybroker_features?: Json | null
          easybroker_id?: string | null
          easybroker_images_json?: Json | null
          easybroker_source_data?: Json | null
          estacionamientos?: number
          habitaciones: number
          id?: number
          id_ciudad: number
          id_estado: number
          id_tipo_accion: number
          id_tipo_uso: number
          id_usuario: string
          is_unit?: boolean
          nombre: string
          parent_id?: number | null
          precio: number
          tipo: Database["public"]["Enums"]["tipo_propiedad"]
          updated_at?: string | null
        }
        Update: {
          area?: number
          area_construida?: number
          banios?: number
          caracteristicas?: string | null
          codigo_postal?: string | null
          colonia?: string | null
          created_at?: string
          descripcion?: string
          descripcion_estado?: string
          descripcion_inversion?: string | null
          direccion?: string
          easybroker_features?: Json | null
          easybroker_id?: string | null
          easybroker_images_json?: Json | null
          easybroker_source_data?: Json | null
          estacionamientos?: number
          habitaciones?: number
          id?: number
          id_ciudad?: number
          id_estado?: number
          id_tipo_accion?: number
          id_tipo_uso?: number
          id_usuario?: string
          is_unit?: boolean
          nombre?: string
          parent_id?: number | null
          precio?: number
          tipo?: Database["public"]["Enums"]["tipo_propiedad"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "desarrollos_id_usuario_fkey1"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedades_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes: {
        Row: {
          banos: number | null
          comentarios: string | null
          correo_contacto: string
          created_at: string
          detalles_adicionales: string | null
          estacionamientos: number | null
          estado_solicitud: Database["public"]["Enums"]["estado_solicitud"]
          habitaciones: number | null
          id: number
          id_ciudad: number | null
          id_estado: number
          metros_cuadrados: number | null
          nombre_contacto: string | null
          presupuesto_max: number | null
          presupuesto_min: number | null
          telefono_contacto: string | null
          tipo_operacion: Database["public"]["Enums"]["tipo_operacion"]
          tipo_propiedad_id: number
          updated_at: string
          usuario_id: string
          zona: string | null
        }
        Insert: {
          banos?: number | null
          comentarios?: string | null
          correo_contacto: string
          created_at?: string
          detalles_adicionales?: string | null
          estacionamientos?: number | null
          estado_solicitud?: Database["public"]["Enums"]["estado_solicitud"]
          habitaciones?: number | null
          id?: number
          id_ciudad?: number | null
          id_estado: number
          metros_cuadrados?: number | null
          nombre_contacto?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          telefono_contacto?: string | null
          tipo_operacion: Database["public"]["Enums"]["tipo_operacion"]
          tipo_propiedad_id: number
          updated_at?: string
          usuario_id: string
          zona?: string | null
        }
        Update: {
          banos?: number | null
          comentarios?: string | null
          correo_contacto?: string
          created_at?: string
          detalles_adicionales?: string | null
          estacionamientos?: number | null
          estado_solicitud?: Database["public"]["Enums"]["estado_solicitud"]
          habitaciones?: number | null
          id?: number
          id_ciudad?: number | null
          id_estado?: number
          metros_cuadrados?: number | null
          nombre_contacto?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          telefono_contacto?: string | null
          tipo_operacion?: Database["public"]["Enums"]["tipo_operacion"]
          tipo_propiedad_id?: number
          updated_at?: string
          usuario_id?: string
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_inmuebles_id_ciudad_fkey"
            columns: ["id_ciudad"]
            isOneToOne: false
            referencedRelation: "ciudades"
            referencedColumns: ["id_ciudad"]
          },
          {
            foreignKeyName: "solicitudes_inmuebles_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id_estado"]
          },
          {
            foreignKeyName: "solicitudes_inmuebles_tipo_propiedad_id_fkey"
            columns: ["tipo_propiedad_id"]
            isOneToOne: false
            referencedRelation: "tipospropiedades"
            referencedColumns: ["id_tipo_propiedad"]
          },
          {
            foreignKeyName: "solicitudes_inmuebles_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      statuspropiedad: {
        Row: {
          created_at: string
          id_status_propiedad: number
          nombre_status_propiedad: string
        }
        Insert: {
          created_at?: string
          id_status_propiedad?: number
          nombre_status_propiedad: string
        }
        Update: {
          created_at?: string
          id_status_propiedad?: number
          nombre_status_propiedad?: string
        }
        Relationships: []
      }
      tax_attributes: {
        Row: {
          clave: string
          created_at: string
          es_global: boolean
          id: number
          nombre: string
          opciones_enum: string[] | null
          orden: number
          requerido: boolean
          subsegment_id: number | null
          tipo_dato: string
          unidad: string | null
        }
        Insert: {
          clave: string
          created_at?: string
          es_global?: boolean
          id?: number
          nombre: string
          opciones_enum?: string[] | null
          orden?: number
          requerido?: boolean
          subsegment_id?: number | null
          tipo_dato: string
          unidad?: string | null
        }
        Update: {
          clave?: string
          created_at?: string
          es_global?: boolean
          id?: number
          nombre?: string
          opciones_enum?: string[] | null
          orden?: number
          requerido?: boolean
          subsegment_id?: number | null
          tipo_dato?: string
          unidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_attributes_subsegment_id_fkey"
            columns: ["subsegment_id"]
            isOneToOne: false
            referencedRelation: "tax_subsegments"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_segments: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
          orden: number
          vertical_id: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre: string
          orden?: number
          vertical_id: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre?: string
          orden?: number
          vertical_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_segments_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "tax_verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_subsegments: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
          orden: number
          segment_id: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre: string
          orden?: number
          segment_id: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre?: string
          orden?: number
          segment_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_subsegments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "tax_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_tipologias: {
        Row: {
          activo: boolean
          codigo_oficial: string | null
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
          orden: number
          vertical_id: number
        }
        Insert: {
          activo?: boolean
          codigo_oficial?: string | null
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre: string
          orden?: number
          vertical_id: number
        }
        Update: {
          activo?: boolean
          codigo_oficial?: string | null
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre?: string
          orden?: number
          vertical_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_tipologias_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "tax_verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_verticals: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          icono: string | null
          id: number
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: number
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: number
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      tipospropiedades: {
        Row: {
          created_at: string
          id_tipo_propiedad: number
          nombre_tipo_propiedad: string
        }
        Insert: {
          created_at?: string
          id_tipo_propiedad?: number
          nombre_tipo_propiedad: string
        }
        Update: {
          created_at?: string
          id_tipo_propiedad?: number
          nombre_tipo_propiedad?: string
        }
        Relationships: []
      }
      user_sites: {
        Row: {
          cbf_api_key: string
          created_at: string | null
          custom_domain: string | null
          id: string
          is_active: boolean | null
          seo_config: Json | null
          site_name: string
          subdomain: string | null
          theme_config: Json | null
          updated_at: string | null
          user_id_supabase: string
        }
        Insert: {
          cbf_api_key: string
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          seo_config?: Json | null
          site_name: string
          subdomain?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          user_id_supabase: string
        }
        Update: {
          cbf_api_key?: string
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          seo_config?: Json | null
          site_name?: string
          subdomain?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          user_id_supabase?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sites_user_id_supabase_fkey"
            columns: ["user_id_supabase"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usospropiedades: {
        Row: {
          created_at: string
          id_uso_propiedad: number
          nombre_uso_propiedad: string
        }
        Insert: {
          created_at?: string
          id_uso_propiedad?: number
          nombre_uso_propiedad: string
        }
        Update: {
          created_at?: string
          id_uso_propiedad?: number
          nombre_uso_propiedad?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          actividad_usuario: string | null
          banner_usuario: string | null
          descripcion_usuario: string | null
          email_usuario: string
          estado_usuario: boolean
          fecha_creacion_usuario: string
          id: string
          id_ciudad: number | null
          id_estado: number | null
          imagen_perfil_usuario: string | null
          nombre_usuario: string | null
          telefono_usuario: string | null
        }
        Insert: {
          actividad_usuario?: string | null
          banner_usuario?: string | null
          descripcion_usuario?: string | null
          email_usuario: string
          estado_usuario?: boolean
          fecha_creacion_usuario?: string
          id: string
          id_ciudad?: number | null
          id_estado?: number | null
          imagen_perfil_usuario?: string | null
          nombre_usuario?: string | null
          telefono_usuario?: string | null
        }
        Update: {
          actividad_usuario?: string | null
          banner_usuario?: string | null
          descripcion_usuario?: string | null
          email_usuario?: string
          estado_usuario?: boolean
          fecha_creacion_usuario?: string
          id?: string
          id_ciudad?: number | null
          id_estado?: number | null
          imagen_perfil_usuario?: string | null
          nombre_usuario?: string | null
          telefono_usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_id_ciudad_fkey"
            columns: ["id_ciudad"]
            isOneToOne: false
            referencedRelation: "ciudades"
            referencedColumns: ["id_ciudad"]
          },
          {
            foreignKeyName: "usuarios_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id_estado"]
          },
        ]
      }
      zonas: {
        Row: {
          created_at: string
          id_ciudad: number | null
          id_zona: number
          nombre_zona: string | null
        }
        Insert: {
          created_at?: string
          id_ciudad?: number | null
          id_zona?: number
          nombre_zona?: string | null
        }
        Update: {
          created_at?: string
          id_ciudad?: number | null
          id_zona?: number
          nombre_zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zonas_id_ciudad_fkey"
            columns: ["id_ciudad"]
            isOneToOne: false
            referencedRelation: "ciudades"
            referencedColumns: ["id_ciudad"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_solicitud: "nueva" | "en_proceso" | "completada" | "cancelada"
      offer_status: "Activa" | "Pausada"
      tipo_operacion: "Comprar" | "Rentar"
      tipo_propiedad:
        | "Casa sola"
        | "Casa en condominio"
        | "Villa / Residencia"
        | "Departamento"
        | "Loft"
        | "Penthouse"
        | "Studio"
        | "Casa de playa"
        | "Cabaña / Glamping"
        | "Local comercial"
        | "Plaza comercial"
        | "Centro comercial"
        | "Restaurante"
        | "Dark kitchen"
        | "Oficina corporativa"
        | "Coworking / Flex"
        | "Consultorio"
        | "Bodega logística"
        | "Centro de distribución"
        | "Nave industrial"
        | "Parque industrial"
        | "Hotel"
        | "Boutique hotel"
        | "Airbnb / Vacation rental"
        | "Clínica / Consultorio"
        | "Hospital"
        | "Terreno urbano"
        | "Lote residencial"
        | "Terreno industrial"
        | "Terreno agropecuario"
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
      estado_solicitud: ["nueva", "en_proceso", "completada", "cancelada"],
      offer_status: ["Activa", "Pausada"],
      tipo_operacion: ["Comprar", "Rentar"],
      tipo_propiedad: [
        "Casa sola",
        "Casa en condominio",
        "Villa / Residencia",
        "Departamento",
        "Loft",
        "Penthouse",
        "Studio",
        "Casa de playa",
        "Cabaña / Glamping",
        "Local comercial",
        "Plaza comercial",
        "Centro comercial",
        "Restaurante",
        "Dark kitchen",
        "Oficina corporativa",
        "Coworking / Flex",
        "Consultorio",
        "Bodega logística",
        "Centro de distribución",
        "Nave industrial",
        "Parque industrial",
        "Hotel",
        "Boutique hotel",
        "Airbnb / Vacation rental",
        "Clínica / Consultorio",
        "Hospital",
        "Terreno urbano",
        "Lote residencial",
        "Terreno industrial",
        "Terreno agropecuario",
      ],
    },
  },
} as const;

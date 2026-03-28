-- Migration: actividad_usuario — Activity tracking for Brain ML pipelines
-- Tracks all user interactions: navigation, searches, reports, valuations, etc.
-- Feeds into Brain Feature Store for ML personalization

CREATE TABLE IF NOT EXISTS public.actividad_usuario (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_actividad TEXT NOT NULL,     -- 'busqueda', 'vista_propiedad', 'estimacion', 'reporte', 'navegacion', 'solicitud_creada', 'solicitud_aprobada', 'oferta_creada', 'cliente_creado', 'propiedad_listada', 'copilot_query'
  modulo TEXT NOT NULL,              -- 'dashboard', 'explore', 'crm', 'profile', 'requests', 'my-site', 'copilot'
  entidad_id TEXT,                   -- ID of the related entity (property, request, etc.)
  entidad_tipo TEXT,                 -- 'propiedad', 'solicitud', 'oferta', 'cliente'
  metadata JSONB DEFAULT '{}',       -- Additional data: filters, zone, vertical, typology, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actividad_usuario_id ON public.actividad_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_actividad_tipo ON public.actividad_usuario(tipo_actividad);
CREATE INDEX IF NOT EXISTS idx_actividad_modulo ON public.actividad_usuario(modulo);
CREATE INDEX IF NOT EXISTS idx_actividad_created ON public.actividad_usuario(created_at DESC);

-- RLS Policies
ALTER TABLE public.actividad_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.actividad_usuario
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own activity"
  ON public.actividad_usuario
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

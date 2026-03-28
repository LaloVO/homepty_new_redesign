-- ============================================================
-- MIGRACIÓN: Integración EasyBroker CRM en Homepty-new
-- Fecha: 2026-02-24
-- Descripción: Crea las tablas necesarias para la integración
--              de EasyBroker y extiende la tabla propiedades.
-- BD: hdnpkmnrnfkiuadpbeac
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EXTENDER TABLA propiedades
--    Agregar campos de EasyBroker. Se usan IF NOT EXISTS
--    para que la migración sea idempotente.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS easybroker_id         TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS easybroker_images_json JSONB       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS easybroker_features   JSONB       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS easybroker_source_data JSONB      DEFAULT NULL;

-- Índice único para evitar duplicados al re-sincronizar
CREATE UNIQUE INDEX IF NOT EXISTS idx_propiedades_easybroker_id
  ON propiedades (easybroker_id)
  WHERE easybroker_id IS NOT NULL;

COMMENT ON COLUMN propiedades.easybroker_id
  IS 'ID público de la propiedad en EasyBroker (ej: EB-DA6589). Clave de deduplicación.';
COMMENT ON COLUMN propiedades.easybroker_images_json
  IS 'Array JSON con las URLs de todas las imágenes importadas de EasyBroker.';
COMMENT ON COLUMN propiedades.easybroker_features
  IS 'Array JSON con las features/características de EasyBroker (ej: ["Alberca", "Gimnasio"]).';
COMMENT ON COLUMN propiedades.easybroker_source_data
  IS 'Objeto JSON completo del detalle de la propiedad en EasyBroker, para auditoría.';

-- ─────────────────────────────────────────────────────────────
-- 2. TABLA easybroker_integrations
--    Almacena la configuración de la integración por usuario.
--    Cada usuario tiene un máximo de 1 integración (UNIQUE en id_usuario).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS easybroker_integrations (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario            TEXT        NOT NULL UNIQUE
                          REFERENCES usuarios (id) ON DELETE CASCADE,
  api_key               TEXT        NOT NULL,
  is_active             BOOLEAN     NOT NULL DEFAULT TRUE,
  last_sync_at          TIMESTAMPTZ DEFAULT NULL,
  last_sync_status      TEXT        DEFAULT 'pending'
                          CHECK (last_sync_status IN ('success', 'error', 'pending')),
  sync_frequency_hours  INT         DEFAULT 24
                          CHECK (sync_frequency_hours > 0),
  properties_synced_count INT       DEFAULT 0,
  error_message         TEXT        DEFAULT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE easybroker_integrations
  IS 'Configuración de la integración con EasyBroker CRM por usuario. Máximo 1 registro por usuario.';
COMMENT ON COLUMN easybroker_integrations.api_key
  IS 'API Key de EasyBroker del usuario. Se envía en header X-Authorization.';
COMMENT ON COLUMN easybroker_integrations.last_sync_status
  IS 'Estado de la última sincronización: success, error, pending.';

-- RLS
ALTER TABLE easybroker_integrations ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede ver/modificar su propia integración
CREATE POLICY "easybroker_integrations_select_own"
  ON easybroker_integrations FOR SELECT
  USING (id_usuario = auth.uid()::TEXT);

CREATE POLICY "easybroker_integrations_insert_own"
  ON easybroker_integrations FOR INSERT
  WITH CHECK (id_usuario = auth.uid()::TEXT);

CREATE POLICY "easybroker_integrations_update_own"
  ON easybroker_integrations FOR UPDATE
  USING (id_usuario = auth.uid()::TEXT);

CREATE POLICY "easybroker_integrations_delete_own"
  ON easybroker_integrations FOR DELETE
  USING (id_usuario = auth.uid()::TEXT);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_easybroker_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_easybroker_integrations_updated_at
  BEFORE UPDATE ON easybroker_integrations
  FOR EACH ROW EXECUTE FUNCTION update_easybroker_integrations_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 3. TABLA easybroker_sync_logs
--    Historial de sincronizaciones. Cada vez que el usuario
--    sincroniza, se crea un registro en esta tabla.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS easybroker_sync_logs (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id      UUID        NOT NULL
                        REFERENCES easybroker_integrations (id) ON DELETE CASCADE,
  sync_started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_completed_at   TIMESTAMPTZ DEFAULT NULL,
  status              TEXT        DEFAULT 'running'
                        CHECK (status IN ('running', 'success', 'error')),
  properties_added    INT         DEFAULT 0,
  properties_updated  INT         DEFAULT 0,
  properties_failed   INT         DEFAULT 0,
  error_details       JSONB       DEFAULT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE easybroker_sync_logs
  IS 'Historial de sincronizaciones con EasyBroker. Un registro por ejecución de sync.';
COMMENT ON COLUMN easybroker_sync_logs.status
  IS 'Estado del proceso: running (en progreso), success (exitoso), error (falló).';
COMMENT ON COLUMN easybroker_sync_logs.error_details
  IS 'JSON con detalles de errores individuales por propiedad, si los hubo.';

-- RLS: el usuario solo ve los logs de su integración (JOIN implícito via integration_id)
ALTER TABLE easybroker_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "easybroker_sync_logs_select_own"
  ON easybroker_sync_logs FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM easybroker_integrations
      WHERE id_usuario = auth.uid()::TEXT
    )
  );

-- Solo el backend (service role) puede insertar/actualizar logs
-- Las políticas de insert/update se omiten para RLS, el servidor backend
-- utiliza la service role key para estas operaciones.


-- ─────────────────────────────────────────────────────────────
-- 4. ÍNDICES de soporte
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_easybroker_sync_logs_integration_id
  ON easybroker_sync_logs (integration_id);

CREATE INDEX IF NOT EXISTS idx_easybroker_sync_logs_created_at
  ON easybroker_sync_logs (created_at DESC);

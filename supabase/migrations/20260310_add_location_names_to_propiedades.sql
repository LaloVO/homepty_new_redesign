-- ============================================================
-- MIGRACIÓN: Agregar columnas ciudad_nombre y estado_nombre
-- a la tabla propiedades para evitar JOINs costosos en reads
-- y mostrar correctamente la ubicación en la UI.
--
-- EJECUTAR EN: Supabase Dashboard > SQL Editor
-- PROYECTO: hdnpkmnrnfkiuadpbeac
-- ============================================================

ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS ciudad_nombre TEXT,
  ADD COLUMN IF NOT EXISTS estado_nombre TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN propiedades.ciudad_nombre IS 'Nombre de texto de la ciudad (cache desnormalizado de ciudades.nombre_ciudad)';
COMMENT ON COLUMN propiedades.estado_nombre IS 'Nombre de texto del estado (cache desnormalizado de estados.nombre_estado)';

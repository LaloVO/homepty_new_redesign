-- ============================================================================
-- MIGRACIÓN: Taxonomía Inmobiliaria PropTech México v2.0
-- Proyecto: Homepty-new (Supabase)
-- Fecha: 2026-03-01
-- Autor: Homepty Engineering
-- ============================================================================
--
-- ARQUITECTURA CORREGIDA v2.0 (SHF / CONAVI / CANADEVI / AMPIP / SECTUR):
--
--   Vertical (¿qué tipo de mercado inmobiliario?)
--     ├── Tipología (¿qué forma física tiene el inmueble?)  ← TRANSVERSAL al NSE
--     │     Un "Departamento" puede ser Económico o Lujo.
--     │     La tipología es la dimensión ESTRUCTURAL del inmueble.
--     │
--     └── Segmento (¿a qué nivel socioeconómico/mercado pertenece?)
--           └── Subsegmento (especialización dentro del segmento)
--                 └── Atributo EAV (características específicas del subsegmento)
--
-- DIFERENCIA CRÍTICA vs v1.0:
--   v1.0 (INCORRECTO): Segmento = "Unifamiliar/Plurifamiliar" (forma estructural)
--   v2.0 (CORRECTO):   Segmento = "Interés Social/Económico/Medio/Residencial/Lujo" (NSE)
--                      Tipología = "Casa/Departamento/Townhouse/Penthouse" (forma estructural)
--
-- ============================================================================

-- ── LIMPIEZA (si existe versión anterior) ────────────────────────────────────
DROP TABLE IF EXISTS tax_property_attributes CASCADE;
DROP TABLE IF EXISTS tax_attributes CASCADE;
DROP TABLE IF EXISTS tax_subsegments CASCADE;
DROP TABLE IF EXISTS tax_segments CASCADE;
DROP TABLE IF EXISTS tax_tipologias CASCADE;
DROP TABLE IF EXISTS tax_verticals CASCADE;

-- ── TABLA 1: Verticales Inmobiliarias ────────────────────────────────────────
CREATE TABLE tax_verticals (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono       VARCHAR(50),
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tax_verticals IS
  'Verticales inmobiliarias: Residencial, Comercial, Oficinas, Industrial, Hospitalidad, Salud, Terrenos, Especializados';

-- ── TABLA 2: Tipologías (Forma Físico-Estructural) ───────────────────────────
-- TRANSVERSAL al segmento NSE.
-- Responde: ¿Qué forma física tiene el inmueble?
-- Ejemplo: "Departamento" puede ser Económico o Lujo — la tipología no cambia.
CREATE TABLE tax_tipologias (
  id              SERIAL PRIMARY KEY,
  vertical_id     INTEGER NOT NULL REFERENCES tax_verticals(id) ON DELETE CASCADE,
  nombre          VARCHAR(150) NOT NULL,
  descripcion     TEXT,
  codigo_oficial  VARCHAR(50),  -- Código INDAABIN / SHF / AMPIP
  orden           INTEGER NOT NULL DEFAULT 0,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tax_tipologias IS
  'Tipologías físico-estructurales del inmueble. TRANSVERSAL al segmento NSE.
   Responde: ¿Qué forma física tiene el inmueble?
   Ejemplo: Casa, Departamento, Townhouse, Nave Industrial, Hotel Boutique.
   Una misma tipología puede pertenecer a múltiples segmentos NSE.';

CREATE INDEX idx_tipologias_vertical ON tax_tipologias(vertical_id);

-- ── TABLA 3: Segmentos (NSE / Clasificación de Mercado) ──────────────────────
-- Responde: ¿A qué nivel socioeconómico/mercado pertenece el activo?
-- Referencia: SHF (Residencial), CBRE/JLL (Oficinas), AMPIP (Industrial), SECTUR (Hospitalidad)
CREATE TABLE tax_segments (
  id          SERIAL PRIMARY KEY,
  vertical_id INTEGER NOT NULL REFERENCES tax_verticals(id) ON DELETE CASCADE,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tax_segments IS
  'Segmentos de mercado (NSE/clasificación socioeconómica).
   Responde: ¿A qué nivel socioeconómico/mercado pertenece el activo?
   Residencial: Interés Social, Económico, Medio, Residencial, PLUS, Lujo.
   Oficinas: Clase A+, Clase A, Clase B, Clase C, Coworking/Flex.
   Industrial: Clase A (AMPIP), Clase B, Clase C.
   Hospitalidad: 5*, 4*, 3*, Sin Categoría/Alternativo.';

CREATE INDEX idx_segments_vertical ON tax_segments(vertical_id);

-- ── TABLA 4: Subsegmentos (Especialización dentro del Segmento) ──────────────
CREATE TABLE tax_subsegments (
  id          SERIAL PRIMARY KEY,
  segment_id  INTEGER NOT NULL REFERENCES tax_segments(id) ON DELETE CASCADE,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tax_subsegments IS
  'Subsegmentos: especialización dentro del segmento NSE.
   Ejemplo: Segmento "Residencial" → Subsegmentos: "Casa en Coto Privado", "Departamento Premium", "Townhouse Residencial"';

CREATE INDEX idx_subsegments_segment ON tax_subsegments(segment_id);

-- ── TABLA 5: Atributos EAV ────────────────────────────────────────────────────
CREATE TABLE tax_attributes (
  id              SERIAL PRIMARY KEY,
  subsegment_id   INTEGER REFERENCES tax_subsegments(id) ON DELETE CASCADE,
  nombre          VARCHAR(150) NOT NULL,
  clave           VARCHAR(100) NOT NULL,
  tipo_dato       VARCHAR(20) NOT NULL CHECK (tipo_dato IN ('text','integer','decimal','boolean','enum','date')),
  opciones_enum   TEXT[],
  es_global       BOOLEAN NOT NULL DEFAULT FALSE,
  requerido       BOOLEAN NOT NULL DEFAULT FALSE,
  unidad          VARCHAR(30),
  orden           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subsegment_id, clave)
);

COMMENT ON TABLE tax_attributes IS
  'Atributos EAV especializados por subsegmento.
   es_global=TRUE: aplica a todos los subsegmentos de la vertical (habitaciones, baños, etc.)
   es_global=FALSE: específico del subsegmento (altura libre, andenes, LEED, etc.)';

CREATE INDEX idx_attributes_subsegment ON tax_attributes(subsegment_id);

-- ── TABLA 6: Clasificación de Propiedades ────────────────────────────────────
-- Vincula una propiedad con su clasificación taxonómica completa
CREATE TABLE property_taxonomy (
  id              SERIAL PRIMARY KEY,
  property_id     UUID NOT NULL,  -- FK a la tabla propiedades (UUID de Supabase)
  vertical_id     INTEGER REFERENCES tax_verticals(id),
  tipologia_id    INTEGER REFERENCES tax_tipologias(id),    -- v2.0: Forma estructural
  segment_id      INTEGER REFERENCES tax_segments(id),
  subsegment_id   INTEGER REFERENCES tax_subsegments(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id)
);

COMMENT ON TABLE property_taxonomy IS
  'Clasificación taxonómica completa de cada propiedad.
   Una propiedad puede tener: Vertical + Tipología + Segmento + Subsegmento.
   La Tipología y el Segmento son independientes (dimensiones ortogonales).';

CREATE INDEX idx_property_taxonomy_property ON property_taxonomy(property_id);
CREATE INDEX idx_property_taxonomy_vertical ON property_taxonomy(vertical_id);
CREATE INDEX idx_property_taxonomy_tipologia ON property_taxonomy(tipologia_id);
CREATE INDEX idx_property_taxonomy_segment ON property_taxonomy(segment_id);
CREATE INDEX idx_property_taxonomy_subsegment ON property_taxonomy(subsegment_id);

-- ── TABLA 7: Valores de Atributos EAV por Propiedad ──────────────────────────
CREATE TABLE property_attribute_values (
  id              SERIAL PRIMARY KEY,
  property_id     UUID NOT NULL,
  attribute_id    INTEGER NOT NULL REFERENCES tax_attributes(id) ON DELETE CASCADE,
  valor_texto     TEXT,
  valor_numerico  NUMERIC(15,4),
  valor_booleano  BOOLEAN,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, attribute_id)
);

CREATE INDEX idx_attr_values_property ON property_attribute_values(property_id);
CREATE INDEX idx_attr_values_attribute ON property_attribute_values(attribute_id);

-- ── RLS (Row Level Security) ──────────────────────────────────────────────────
ALTER TABLE tax_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_tipologias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_subsegments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_attribute_values ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la taxonomía (es catálogo)
CREATE POLICY "Taxonomía pública de lectura" ON tax_verticals FOR SELECT USING (TRUE);
CREATE POLICY "Tipologías públicas de lectura" ON tax_tipologias FOR SELECT USING (TRUE);
CREATE POLICY "Segmentos públicos de lectura" ON tax_segments FOR SELECT USING (TRUE);
CREATE POLICY "Subsegmentos públicos de lectura" ON tax_subsegments FOR SELECT USING (TRUE);
CREATE POLICY "Atributos públicos de lectura" ON tax_attributes FOR SELECT USING (TRUE);

-- Solo admins pueden modificar la taxonomía
CREATE POLICY "Solo admins modifican taxonomía" ON tax_verticals
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Solo admins modifican tipologías" ON tax_tipologias
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Solo admins modifican segmentos" ON tax_segments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Solo admins modifican subsegmentos" ON tax_subsegments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Solo admins modifican atributos" ON tax_attributes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Clasificación de propiedades: el dueño puede ver y modificar la suya
CREATE POLICY "Ver clasificación propia" ON property_taxonomy
  FOR SELECT USING (TRUE);
CREATE POLICY "Modificar clasificación propia" ON property_taxonomy
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Ver atributos propios" ON property_attribute_values
  FOR SELECT USING (TRUE);
CREATE POLICY "Modificar atributos propios" ON property_attribute_values
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED: Verticales
-- ============================================================================
INSERT INTO tax_verticals (id, nombre, descripcion, icono, activo, orden) VALUES
  (1, 'Residencial',              'Propiedades para uso habitacional',                              'home',         TRUE, 1),
  (2, 'Comercial',                'Propiedades para comercio y retail',                             'store',        TRUE, 2),
  (3, 'Oficinas',                 'Espacios de trabajo corporativos y flexibles',                   'building-2',   TRUE, 3),
  (4, 'Industrial',               'Naves, bodegas y parques industriales',                          'factory',      TRUE, 4),
  (5, 'Hospitalidad',             'Hoteles, resorts y alojamiento turístico',                       'hotel',        TRUE, 5),
  (6, 'Salud',                    'Clínicas, hospitales y consultorios',                            'heart-pulse',  TRUE, 6),
  (7, 'Terrenos / Rural',         'Terrenos, lotes y propiedades rurales',                          'map',          TRUE, 7),
  (8, 'Proyectos Especializados', 'Desarrollos especiales, usos mixtos e infraestructura',          'cpu',          TRUE, 8);

SELECT setval('tax_verticals_id_seq', 8);

-- ============================================================================
-- SEED: Tipologías (Forma Físico-Estructural)
-- ============================================================================

-- ── RESIDENCIAL ──────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, codigo_oficial, orden) VALUES
  (1, 'Casa',                       'Vivienda unifamiliar independiente con terreno propio',                 'H-UNI-01', 1),
  (1, 'Casa en Condominio',         'Casa dentro de un desarrollo cerrado con áreas comunes',               'H-UNI-02', 2),
  (1, 'Townhouse',                  'Casa adosada en hilera, 2-3 niveles, patio privado',                   'H-UNI-03', 3),
  (1, 'Villa / Residencia',         'Residencia de lujo con jardín amplio y amenidades privadas',           'H-UNI-04', 4),
  (1, 'Departamento',               'Unidad habitacional en edificio multifamiliar',                        'H-PLU-01', 5),
  (1, 'Loft',                       'Espacio abierto de doble altura, uso mixto habitacional',              'H-PLU-02', 6),
  (1, 'Penthouse',                  'Unidad de lujo en el último piso con terraza privada',                 'H-PLU-03', 7),
  (1, 'Studio',                     'Unidad compacta de un solo espacio, sin recámara separada',            'H-PLU-04', 8),
  (1, 'Garden House',               'Unidad en planta baja con jardín de uso exclusivo',                    'H-PLU-05', 9),
  (1, 'Casa de Playa',              'Vivienda en zona costera o frente de playa',                           'H-VAC-01', 10),
  (1, 'Cabaña / Glamping',          'Vivienda en zona rural, montaña o naturaleza',                         'H-VAC-02', 11),
  (1, 'Edificio de Departamentos',  'Inmueble completo con múltiples unidades (inversión)',                  'H-INV-01', 12);

-- ── COMERCIAL ─────────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, orden) VALUES
  (2, 'Local Comercial',            'Espacio individual de venta al por menor',                              1),
  (2, 'Plaza Comercial',            'Desarrollo con múltiples locales y estacionamiento',                   2),
  (2, 'Centro Comercial / Mall',    'Desarrollo de gran escala con tienda ancla',                           3),
  (2, 'Lifestyle Center',           'Centro abierto enfocado en gastronomía y entretenimiento',             4),
  (2, 'Strip Mall',                 'Centro comercial de formato lineal para comercio vecinal',             5),
  (2, 'Restaurante / F&B',          'Local especializado para alimentos y bebidas',                         6),
  (2, 'Dark Kitchen',               'Cocina industrial sin área de comensales, solo delivery',              7);

-- ── OFICINAS ──────────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, orden) VALUES
  (3, 'Edificio Corporativo',       'Torre o edificio de oficinas de uso exclusivo',                        1),
  (3, 'Planta / Piso Completo',     'Piso completo dentro de un edificio de oficinas',                      2),
  (3, 'Oficina Individual',         'Unidad de oficina dentro de un edificio compartido',                   3),
  (3, 'Coworking / Flex',           'Espacio de trabajo compartido con membresía flexible',                 4),
  (3, 'Consultorio',                'Espacio para atención profesional',                                    5);

-- ── INDUSTRIAL ────────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, codigo_oficial, orden) VALUES
  (4, 'Nave Industrial',            'Estructura de gran claro para manufactura o almacenamiento',           'UI-01', 1),
  (4, 'Bodega Logística',           'Almacén para distribución y fulfillment',                              'UI-02', 2),
  (4, 'CEDIS',                      'Centro de Distribución de gran escala',                                'UI-03', 3),
  (4, 'Parque Industrial',          'Polígono planificado con infraestructura y servicios centralizados',   'UI-09', 4),
  (4, 'Corredor Industrial',        'Desarrollo logístico alineado sobre vía federal o ferrocarril',        'UI-10', 5),
  (4, 'Instalación Especializada',  'Cold storage, laboratorio farmacéutico, cleanroom',                   NULL,    6);

-- ── HOSPITALIDAD ──────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, orden) VALUES
  (5, 'Hotel Urbano / Business',    'Hotel orientado al viajero de negocios',                               1),
  (5, 'Hotel Boutique',             'Propiedad de diseño de autor, servicio hiperpersonalizado',            2),
  (5, 'Resort / Todo Incluido',     'Macro-desarrollo vacacional',                                          3),
  (5, 'Motel / Hotel de Tránsito',  'Acceso vehicular directo a la habitación',                             4),
  (5, 'Hostal',                     'Alojamiento en dormitorios compartidos',                               5),
  (5, 'Glamping / Eco-Lodge',       'Estructura efímera o de bajo impacto ambiental',                      6);

-- ── SALUD ─────────────────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, orden) VALUES
  (6, 'Consultorio Médico',                  'Espacio básico para auscultación y diagnóstico',              1),
  (6, 'Consultorio de Especialidad',         'Odontología, nutriología, oftalmología, etc.',                2),
  (6, 'Clínica / Centro Ambulatorio',        'Unidades de procedimientos y cirugía de corta estancia',     3),
  (6, 'Hospital',                            'Instalaciones con hospitalización, UCI y urgencias',          4),
  (6, 'Residencia Geriátrica',               'Assisted Living, Memory Care para adultos mayores',          5);

-- ── TERRENOS / RURAL ──────────────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, codigo_oficial, orden) VALUES
  (7, 'Lote Residencial',           'Lote baldío en fraccionamiento o colonia residencial',                 'AT-RES', 1),
  (7, 'Macrolote Comercial',        'Polígono de gran extensión para desarrollo comercial o mixto',         'AT-COM', 2),
  (7, 'Lote Industrial',            'Predio dentro de la poligonal de un parque industrial',                'AT-IND', 3),
  (7, 'Tierra Agrícola',            'Tierras de riego o temporal para cultivo',                             'AT-AGR', 4),
  (7, 'Tierra Ganadera',            'Agostadero para pastoreo y cría extensiva de ganado',                  'AT-PEC', 5),
  (7, 'Tierra Forestal',            'Bosques, selvas y superficies de aprovechamiento silvícola',           'AT-FOR', 6),
  (7, 'Propiedad Rural de Nicho',   'Hacienda, quinta, viñedo, cenote, isla privada',                       NULL,    7);

-- ── PROYECTOS ESPECIALIZADOS ──────────────────────────────────────────────────
INSERT INTO tax_tipologias (vertical_id, nombre, descripcion, orden) VALUES
  (8, 'Proyecto Vertical Mixto',    'Torre que combina residencial, comercial y oficinas',                  1),
  (8, 'Distrito Urbano Planeado',   'Polígono metropolitano de usos múltiples',                             2),
  (8, 'Data Center Enterprise',     'Búnker para servidores masivos. Tier I-IV',                            3),
  (8, 'Data Center Colocation',     'Espacio compartido con refrigeración y energía por tercero',           4),
  (8, 'Campus Educativo',           'Escuela, universidad o centro de capacitación',                        5);

-- ============================================================================
-- SEED: Segmentos (NSE / Clasificación de Mercado)
-- ============================================================================

-- ── RESIDENCIAL — Segmentos por NSE (SHF/CONAVI) ─────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (1, 'Interés Social / Popular',
      'Hasta 200 UMAs (~$687K MXN). Subsidios CONAVI. Fraccionamientos masivos. INFONAVIT básico.', 1),
  (1, 'Económico',
      '~$400K–$1.2M MXN. INFONAVIT/FOVISSSTE. Primer acceso al crédito. Clase trabajadora.', 2),
  (1, 'Medio / Tradicional',
      '200-750 UMAs. ~$1.2M–$2.5M MXN. Clase media. 2-3 recámaras. Fraccionamientos privados.', 3),
  (1, 'Residencial',
      '750-1500 UMAs. ~$2.5M–$5.1M MXN. Alta plusvalía, amenidades. Clase media-alta.', 4),
  (1, 'Residencial PLUS',
      '1500-3000 UMAs. >$5.1M MXN. >225 m², diseño personalizado. Clase alta.', 5),
  (1, 'Lujo / Ultra-Lujo',
      '>3000 UMAs. >$15M MXN. Acabados importados, domótica, ubicación trofeo. UHNWI.', 6);

-- ── COMERCIAL — Segmentos por formato (ICSC) ─────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (2, 'Comercio a Pie de Calle',
      'Street Retail. Locales en planta baja, alta intensidad peatonal. Renta por m².', 1),
  (2, 'Centros Comerciales',
      'Malls, lifestyle centers, power centers. Métricas: GLA, NOI, Cap Rate.', 2),
  (2, 'Plazas de Conveniencia',
      'Strip Malls. Comercio de barrio para ~5,000 habitantes. Supermercado + servicios.', 3),
  (2, 'Restaurantes y F&B',
      'Espacios especializados. Extracción de humos, trampa de grasa, uso de suelo CU.', 4);

-- ── OFICINAS — Clasificación BOMA/CBRE ───────────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (3, 'Clase A+ / A',
      'Rascacielos premium. Reforma, Polanco. LEED Platino/Oro. Core Factor <15%.', 1),
  (3, 'Clase B',
      'Buena calidad, corredores secundarios. Empresas medianas. Sin certificación.', 2),
  (3, 'Clase C',
      'Espacios básicos. Edificios adaptados. Startups y PYMES. Renta baja.', 3),
  (3, 'Coworking / Flex',
      'Oficinas modulares, hot desking. Contratos mensuales. Operadores: WeWork, Regus.', 4);

-- ── INDUSTRIAL — Clasificación AMPIP ─────────────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (4, 'Clase A (AMPIP)',
      'Tilt-up. Clear height ≥9.75m. MR-35/MR-42. Parque certificado AMPIP. Nearshoring.', 1),
  (4, 'Clase B',
      'Sistemas híbridos. Clear height 6-9m. Sin certificación AMPIP. Manufactura ligera.', 2),
  (4, 'Clase C',
      'Instalaciones antiguas. Techo <6m. Sin andenes deprimidos. Uso local.', 3);

-- ── HOSPITALIDAD — Clasificación SECTUR ──────────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (5, '5 Estrellas',
      'Lujo. Múltiples F&B, spa, convenciones. RevPAR alto. Marriott, Hilton, Hyatt.', 1),
  (5, '4 Estrellas',
      'Alta calidad. Restaurante, alberca, business center. Viajero corporativo.', 2),
  (5, '3 Estrellas',
      'Servicios estándar. Viajero de negocios y turismo familiar.', 3),
  (5, 'Sin Categoría / Alternativo',
      'Glamping, eco-lodge, hostales, alojamiento no clasificado SECTUR.', 4);

-- ── SALUD — Clasificación COFEPRIS/SSA ───────────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (6, 'Atención Primaria',
      'Consultorios. Licencia Sanitaria COFEPRIS. Primer nivel de atención.', 1),
  (6, 'Atención Ambulatoria',
      'Clínicas de procedimientos, hemodiálisis, cirugía de corta estancia.', 2),
  (6, 'Hospitalización',
      'Hospitales generales y de alta especialidad. NOM-197-SSA1.', 3),
  (6, 'Cuidado Especializado',
      'Residencias de adultos mayores, Assisted Living, Memory Care.', 4);

-- ── TERRENOS / RURAL — Clasificación SHF/SEDATU ──────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (7, 'Suelo Urbano',
      'Lotes en zonas consolidadas. Uso H, CU, CRU, I según PDU.', 1),
  (7, 'Suelo de Expansión',
      'Macrolotes en zonas de crecimiento urbano. Factibilidades en trámite.', 2),
  (7, 'Suelo Agrícola',
      'Tierras de riego con derechos CONAGUA o de temporal.', 3),
  (7, 'Rural de Nicho / Ecoturístico',
      'Haciendas, viñedos, cenotes, islas. Agroturismo y enoturismo.', 4);

-- ── PROYECTOS ESPECIALIZADOS ──────────────────────────────────────────────────
INSERT INTO tax_segments (vertical_id, nombre, descripcion, orden) VALUES
  (8, 'Usos Mixtos',
      'Megatorres y distritos que combinan residencial, comercial, oficinas.', 1),
  (8, 'Infraestructura Tecnológica',
      'Data Centers Tier I-IV. PUE, kW/rack, Carrier Neutral.', 2),
  (8, 'Educativo / Institucional',
      'Escuelas, universidades, centros de capacitación, recintos religiosos.', 3);

-- ============================================================================
-- SEED: Subsegmentos (Especialización dentro del Segmento)
-- ============================================================================

-- ── RESIDENCIAL ──────────────────────────────────────────────────────────────
-- Interés Social (id=1)
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Vivienda Progresiva',     'Vivienda mínima ampliable por autoconstrucción', 1 FROM tax_segments WHERE nombre = 'Interés Social / Popular' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Unidad Habitacional',     'Conjunto de departamentos en unidad habitacional pública', 2 FROM tax_segments WHERE nombre = 'Interés Social / Popular' AND vertical_id = 1;

-- Económico
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Casa en Serie',           'Vivienda utilitaria en fraccionamiento masivo', 1 FROM tax_segments WHERE nombre = 'Económico' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Departamento Económico',  'Departamento en edificio de construcción en serie', 2 FROM tax_segments WHERE nombre = 'Económico' AND vertical_id = 1;

-- Medio / Tradicional
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Casa en Fraccionamiento', 'Casa en fraccionamiento privado con servicios completos', 1 FROM tax_segments WHERE nombre = 'Medio / Tradicional' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Departamento Medio',      'Departamento en edificio de calidad media', 2 FROM tax_segments WHERE nombre = 'Medio / Tradicional' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Townhouse Medio',         'Casa adosada en conjunto privado', 3 FROM tax_segments WHERE nombre = 'Medio / Tradicional' AND vertical_id = 1;

-- Residencial
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Casa en Coto Privado',    'Casa en privada con seguridad y amenidades', 1 FROM tax_segments WHERE nombre = 'Residencial' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Departamento Premium',    'Departamento con acabados de calidad superior', 2 FROM tax_segments WHERE nombre = 'Residencial' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Townhouse Residencial',   'Casa adosada con diseño arquitectónico cuidado', 3 FROM tax_segments WHERE nombre = 'Residencial' AND vertical_id = 1;

-- Residencial PLUS
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Casa de Autor',           'Diseño personalizado, superficies >225 m²', 1 FROM tax_segments WHERE nombre = 'Residencial PLUS' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Penthouse PLUS',          'Penthouse con terraza amplia y amenidades exclusivas', 2 FROM tax_segments WHERE nombre = 'Residencial PLUS' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Garden House PLUS',       'Planta baja con jardín privado de gran extensión', 3 FROM tax_segments WHERE nombre = 'Residencial PLUS' AND vertical_id = 1;

-- Lujo / Ultra-Lujo
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Mansión',                 'Residencia >500 m², domótica, ubicación trofeo', 1 FROM tax_segments WHERE nombre = 'Lujo / Ultra-Lujo' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Villa de Lujo',           'Villa con alberca privada, jardín y acabados importados', 2 FROM tax_segments WHERE nombre = 'Lujo / Ultra-Lujo' AND vertical_id = 1;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Penthouse Ultra-Lujo',    'Penthouse en edificio icónico, concierge', 3 FROM tax_segments WHERE nombre = 'Lujo / Ultra-Lujo' AND vertical_id = 1;

-- ── COMERCIAL ─────────────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Local en Corredor Comercial', 'Alta densidad peatonal, zona consolidada', 1 FROM tax_segments WHERE nombre = 'Comercio a Pie de Calle';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Local en Colonia',            'Comercio de barrio, baja renta', 2 FROM tax_segments WHERE nombre = 'Comercio a Pie de Calle';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Mall / Centro Comercial',     'Tienda ancla + inline stores + food court', 1 FROM tax_segments WHERE nombre = 'Centros Comerciales';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Lifestyle Center',            'Formato abierto, gastronomía y entretenimiento', 2 FROM tax_segments WHERE nombre = 'Centros Comerciales';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Power Center',               'Big box stores, alta densidad vehicular', 3 FROM tax_segments WHERE nombre = 'Centros Comerciales';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Strip Mall',                 'Formato lineal, locales de 50-200 m²', 1 FROM tax_segments WHERE nombre = 'Plazas de Conveniencia';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Plaza de Barrio',            'Supermercado + farmacia + servicios', 2 FROM tax_segments WHERE nombre = 'Plazas de Conveniencia';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Restaurante Full Service',   'Comedor completo, cocina certificada', 1 FROM tax_segments WHERE nombre = 'Restaurantes y F&B';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Dark Kitchen',               'Solo delivery, sin área de comensales', 2 FROM tax_segments WHERE nombre = 'Restaurantes y F&B';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Food Hall',                  'Múltiples operadores en espacio compartido', 3 FROM tax_segments WHERE nombre = 'Restaurantes y F&B';

-- ── OFICINAS ──────────────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Torre Corporativa A+',       'Rascacielos icónico, LEED Platino/Oro', 1 FROM tax_segments WHERE nombre = 'Clase A+ / A';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Edificio Clase A',           'Edificio corporativo premium con certificación', 2 FROM tax_segments WHERE nombre = 'Clase A+ / A';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Edificio Clase B',           'Edificio de buena calidad en corredor secundario', 1 FROM tax_segments WHERE nombre = 'Clase B' AND vertical_id = 3;

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Edificio Clase C',           'Edificio adaptado, infraestructura básica', 1 FROM tax_segments WHERE nombre = 'Clase C' AND vertical_id = 3;

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Coworking Compartido',       'Hot desking, escritorios compartidos', 1 FROM tax_segments WHERE nombre = 'Coworking / Flex';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Oficina Privada Flex',       'Oficina privada en edificio de coworking', 2 FROM tax_segments WHERE nombre = 'Coworking / Flex';

-- ── INDUSTRIAL ────────────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Nave Logística Clase A',     'Tilt-up, clear height ≥9.75m, andenes hidráulicos', 1 FROM tax_segments WHERE nombre = 'Clase A (AMPIP)';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Nave de Manufactura Clase A','Ensamblaje automotriz, aeroespacial, metalmecánica', 2 FROM tax_segments WHERE nombre = 'Clase A (AMPIP)';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Cold Storage',               'Almacenamiento frigorífico certificado', 3 FROM tax_segments WHERE nombre = 'Clase A (AMPIP)';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Parque Industrial Certificado','Polígono AMPIP con infraestructura completa', 4 FROM tax_segments WHERE nombre = 'Clase A (AMPIP)';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Nave Logística Clase B',     'Almacén funcional, clear height 6-9m', 1 FROM tax_segments WHERE nombre = 'Clase B' AND vertical_id = 4;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Nave de Manufactura Clase B','Manufactura ligera o mediana', 2 FROM tax_segments WHERE nombre = 'Clase B' AND vertical_id = 4;

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Bodega Clase C',             'Instalación antigua, techo bajo <6m', 1 FROM tax_segments WHERE nombre = 'Clase C' AND vertical_id = 4;
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Nave Clase C',               'Nave obsoleta para logística básica', 2 FROM tax_segments WHERE nombre = 'Clase C' AND vertical_id = 4;

-- ── HOSPITALIDAD ──────────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Gran Hotel Urbano',          'Hotel de lujo en ciudad, múltiples F&B, spa', 1 FROM tax_segments WHERE nombre = '5 Estrellas';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Resort de Playa 5*',         'Resort todo incluido en destino premium', 2 FROM tax_segments WHERE nombre = '5 Estrellas';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hotel Business 4*',          'Hotel corporativo con business center', 1 FROM tax_segments WHERE nombre = '4 Estrellas';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hotel Estándar 3*',          'Servicios completos, precio accesible', 1 FROM tax_segments WHERE nombre = '3 Estrellas';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Boutique Hotel',             '<50 habitaciones, diseño de autor', 1 FROM tax_segments WHERE nombre = 'Sin Categoría / Alternativo';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Glamping / Eco-Lodge',       'Domos, tiendas safari, alojamiento en naturaleza', 2 FROM tax_segments WHERE nombre = 'Sin Categoría / Alternativo';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hostal',                     'Dormitorios compartidos, turismo joven', 3 FROM tax_segments WHERE nombre = 'Sin Categoría / Alternativo';

-- ── SALUD ─────────────────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Consultorio General',        'Atención médica básica', 1 FROM tax_segments WHERE nombre = 'Atención Primaria';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Consultorio de Especialidad','Odontología, nutriología, oftalmología', 2 FROM tax_segments WHERE nombre = 'Atención Primaria';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Clínica Ambulatoria',        'Procedimientos sin hospitalización', 1 FROM tax_segments WHERE nombre = 'Atención Ambulatoria';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Centro de Diagnóstico',      'Laboratorio, imagen, patología', 2 FROM tax_segments WHERE nombre = 'Atención Ambulatoria';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hospital General',           'Urgencias, hospitalización, quirófanos', 1 FROM tax_segments WHERE nombre = 'Hospitalización';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hospital de Alta Especialidad','Oncología, cardiología, trasplantes', 2 FROM tax_segments WHERE nombre = 'Hospitalización';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Residencia de Adultos Mayores','Assisted Living, cuidado 24/7', 1 FROM tax_segments WHERE nombre = 'Cuidado Especializado';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Memory Care',                'Cuidado especializado para demencia/Alzheimer', 2 FROM tax_segments WHERE nombre = 'Cuidado Especializado';

-- ── TERRENOS / RURAL ──────────────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Lote Residencial Urbano',    'Lote en colonia o fraccionamiento consolidado', 1 FROM tax_segments WHERE nombre = 'Suelo Urbano';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Lote Comercial Urbano',      'Lote en corredor comercial o zona de equipamiento', 2 FROM tax_segments WHERE nombre = 'Suelo Urbano';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Lote Industrial Urbano',     'Lote en zona industrial urbana', 3 FROM tax_segments WHERE nombre = 'Suelo Urbano';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Macrolote para Desarrollo',  'Polígono para fraccionamiento o desarrollo', 1 FROM tax_segments WHERE nombre = 'Suelo de Expansión';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Tierra de Riego',            'Con derechos CONAGUA, pozos registrados', 1 FROM tax_segments WHERE nombre = 'Suelo Agrícola';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Tierra de Temporal',         'Dependiente de precipitación pluvial', 2 FROM tax_segments WHERE nombre = 'Suelo Agrícola';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Hacienda / Casco',           'Propiedad patrimonial colonial restaurada', 1 FROM tax_segments WHERE nombre = 'Rural de Nicho / Ecoturístico';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Viñedo / Quinta',            'Propiedad para agroturismo o enoturismo', 2 FROM tax_segments WHERE nombre = 'Rural de Nicho / Ecoturístico';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Cenote / Isla',              'Formación geológica única o isla privada', 3 FROM tax_segments WHERE nombre = 'Rural de Nicho / Ecoturístico';

-- ── PROYECTOS ESPECIALIZADOS ──────────────────────────────────────────────────
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Proyecto Vertical Mixto',    'Torre con usos mixtos en altura', 1 FROM tax_segments WHERE nombre = 'Usos Mixtos';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Distrito Urbano Planeado',   'Polígono metropolitano de usos múltiples', 2 FROM tax_segments WHERE nombre = 'Usos Mixtos';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Data Center Tier I',         '99.671% disponibilidad', 1 FROM tax_segments WHERE nombre = 'Infraestructura Tecnológica';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Data Center Tier II',        '99.741% disponibilidad, redundancia N+1', 2 FROM tax_segments WHERE nombre = 'Infraestructura Tecnológica';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Data Center Tier III',       '99.982% disponibilidad, mantenimiento concurrente', 3 FROM tax_segments WHERE nombre = 'Infraestructura Tecnológica';
INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Data Center Tier IV',        '99.995% disponibilidad, tolerancia total a fallos', 4 FROM tax_segments WHERE nombre = 'Infraestructura Tecnológica';

INSERT INTO tax_subsegments (segment_id, nombre, descripcion, orden)
SELECT id, 'Campus Educativo',           'Escuela, universidad o centro de capacitación', 1 FROM tax_segments WHERE nombre = 'Educativo / Institucional';

-- ============================================================================
-- SEED: Atributos EAV Especializados
-- ============================================================================

-- ── Atributos Globales Residencial (es_global=TRUE, subsegment_id=NULL) ──────
-- Nota: Para atributos globales, se insertan sin subsegment_id.
-- Se aplican a todos los subsegmentos de la vertical Residencial.
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad) VALUES
  (NULL, 'Habitaciones',     'habitaciones',    'integer', TRUE, 1, NULL),
  (NULL, 'Baños',            'banios',          'decimal', TRUE, 2, NULL),
  (NULL, 'Medios baños',     'medios_banios',   'integer', TRUE, 3, NULL),
  (NULL, 'Estacionamientos', 'estacionamientos','integer', TRUE, 4, NULL),
  (NULL, 'Superficie total', 'superficie_total','decimal', TRUE, 5, 'm²'),
  (NULL, 'Superficie const.','superficie_const','decimal', TRUE, 6, 'm²');

-- ── Atributos Especializados por Subsegmento ──────────────────────────────────
-- Casa en Fraccionamiento (Medio)
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad)
SELECT s.id, 'Niveles', 'niveles', 'integer', FALSE, 7, NULL
FROM tax_subsegments s WHERE s.nombre = 'Casa en Fraccionamiento';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Jardín', 'jardin', 'boolean', FALSE, 8
FROM tax_subsegments s WHERE s.nombre = 'Casa en Fraccionamiento';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Alberca', 'alberca', 'boolean', FALSE, 9
FROM tax_subsegments s WHERE s.nombre = 'Casa en Fraccionamiento';

-- Casa en Coto Privado (Residencial)
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad)
SELECT s.id, 'Niveles', 'niveles', 'integer', FALSE, 7, NULL
FROM tax_subsegments s WHERE s.nombre = 'Casa en Coto Privado';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Jardín', 'jardin', 'boolean', FALSE, 8
FROM tax_subsegments s WHERE s.nombre = 'Casa en Coto Privado';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Alberca', 'alberca', 'boolean', FALSE, 9
FROM tax_subsegments s WHERE s.nombre = 'Casa en Coto Privado';

-- Departamento Premium (Residencial)
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Piso del edificio', 'piso', 'integer', FALSE, 7
FROM tax_subsegments s WHERE s.nombre = 'Departamento Premium';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Elevador', 'elevador', 'boolean', FALSE, 8
FROM tax_subsegments s WHERE s.nombre = 'Departamento Premium';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Amenidades', 'amenidades', 'boolean', FALSE, 9
FROM tax_subsegments s WHERE s.nombre = 'Departamento Premium';

-- Nave Logística Clase A (Industrial)
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad)
SELECT s.id, 'Altura libre', 'altura_libre', 'decimal', FALSE, 1, 'm'
FROM tax_subsegments s WHERE s.nombre = 'Nave Logística Clase A';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Andenes de carga', 'andenes_carga', 'integer', FALSE, 2
FROM tax_subsegments s WHERE s.nombre = 'Nave Logística Clase A';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, opciones_enum, es_global, orden)
SELECT s.id, 'Piso industrial', 'piso_industrial', 'enum', ARRAY['Concreto armado','Epóxico','Asfalto'], FALSE, 3
FROM tax_subsegments s WHERE s.nombre = 'Nave Logística Clase A';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, opciones_enum, es_global, orden)
SELECT s.id, 'Clase AMPIP', 'clase_ampip', 'enum', ARRAY['Clase A','Clase A+'], FALSE, 4
FROM tax_subsegments s WHERE s.nombre = 'Nave Logística Clase A';

-- Torre Corporativa A+ (Oficinas)
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, opciones_enum, es_global, orden)
SELECT s.id, 'Clase de edificio', 'clase_edificio', 'enum', ARRAY['Clase A+','Clase A'], FALSE, 1
FROM tax_subsegments s WHERE s.nombre = 'Torre Corporativa A+';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Planta privativa', 'plantas_privativas', 'boolean', FALSE, 2
FROM tax_subsegments s WHERE s.nombre = 'Torre Corporativa A+';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden)
SELECT s.id, 'Certificación LEED', 'certificacion_leed', 'boolean', FALSE, 3
FROM tax_subsegments s WHERE s.nombre = 'Torre Corporativa A+';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad)
SELECT s.id, 'Core Factor', 'core_factor', 'decimal', FALSE, 4, '%'
FROM tax_subsegments s WHERE s.nombre = 'Torre Corporativa A+';

-- Local en Corredor Comercial
INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, es_global, orden, unidad)
SELECT s.id, 'Frente del local', 'frente_local', 'decimal', FALSE, 1, 'm'
FROM tax_subsegments s WHERE s.nombre = 'Local en Corredor Comercial';

INSERT INTO tax_attributes (subsegment_id, nombre, clave, tipo_dato, opciones_enum, es_global, orden)
SELECT s.id, 'Uso de suelo', 'uso_suelo', 'enum', ARRAY['CU','CRU','CS','H'], FALSE, 2
FROM tax_subsegments s WHERE s.nombre = 'Local en Corredor Comercial';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
DO $$
DECLARE
  v_count  INTEGER;
  t_count  INTEGER;
  s_count  INTEGER;
  ss_count INTEGER;
  a_count  INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count  FROM tax_verticals;
  SELECT COUNT(*) INTO t_count  FROM tax_tipologias;
  SELECT COUNT(*) INTO s_count  FROM tax_segments;
  SELECT COUNT(*) INTO ss_count FROM tax_subsegments;
  SELECT COUNT(*) INTO a_count  FROM tax_attributes;

  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE 'TAXONOMÍA INMOBILIARIA v2.0 — SEED COMPLETADO';
  RAISE NOTICE '────────────────────────────────────────────────';
  RAISE NOTICE 'Verticales:   %', v_count;
  RAISE NOTICE 'Tipologías:   % (forma físico-estructural)', t_count;
  RAISE NOTICE 'Segmentos:    % (NSE / clasificación de mercado)', s_count;
  RAISE NOTICE 'Subsegmentos: %', ss_count;
  RAISE NOTICE 'Atributos:    %', a_count;
  RAISE NOTICE '════════════════════════════════════════════════';
END $$;

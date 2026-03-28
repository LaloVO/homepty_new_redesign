export const ROUTE_TITLES: Record<string, string> = {
  explore: "Explorar",
  requests: "Solicitudes",
  crm: "CRM",
  profile: "Perfil"
};

export const TYPES_OF_OPERATIONS = [
  {
    id: 1,
    value: 1,
    label: "Venta",
  },
  {
    id: 2,
    value: 2,
    label: "Renta",
  },
  {
    id: 3,
    value: 3,
    label: "Traspaso",
  },
  {
    id: 4,
    value: 4,
    label: "Pre-Venta",
  },
  {
    id: 5,
    value: 5,
    label: "Aportación",
  },
  {
    id: 6,
    value: 6,
    label: "Remate",
  },
];

export const TYPES_OF_PROPERTIES = [
  {
    id: 1,
    value: "Casa",
    label: "Casa",
  },
  {
    id: 2,
    value: "Departamento",
    label: "Departamento",
  },
  {
    id: 3,
    value: "Terreno",
    label: "Terreno",
  },
  {
    id: 4,
    value: "Oficina",
    label: "Oficina",
  },
  {
    id: 5,
    value: "Local comercial",
    label: "Local comercial",
  },
  {
    id: 6,
    value: "Bodega",
    label: "Bodega",
  },
  {
    id: 7,
    value: "Loft",
    label: "Loft",
  },
  {
    id: 8,
    value: "Lote",
    label: "Lote",
  },
  {
    id: 9,
    value: "Nave comercial",
    label: "Nave comercial",
  },
];

export const USER_ACTIVITY = [
  { id: 1, value: "Asesor inmobiliario", label: "Asesor inmobiliario" },
  { id: 2, value: "Broker hipotecario", label: "Broker hipotecario" },
  { id: 3, value: "Constructor", label: "Constructor" },
  { id: 4, value: "Desarrollador", label: "Desarrollador" },
  { id: 5, value: "Arquitecto/arquitecta", label: "Arquitecto/arquitecta" },
  { id: 6, value: "Notario", label: "Notario" },
  { id: 7, value: "Inmobiliaria", label: "Inmobiliaria" },
];

/**
 * Tipos de unidad inmobiliaria — cubre todos los subsegmentos de la taxonomía.
 * Una "unidad" es un activo individual que puede pertenecer a un desarrollo
 * o existir de forma independiente.
 */
export const TYPES_OF_UNITS = [
  // --- Residencial ---
  { id: 1,  label: "Casa sola",              value: "Casa sola",              grupo: "Residencial" },
  { id: 2,  label: "Casa en condominio",      value: "Casa en condominio",      grupo: "Residencial" },
  { id: 3,  label: "Villa / Residencia",      value: "Villa / Residencia",      grupo: "Residencial" },
  { id: 4,  label: "Departamento",            value: "Departamento",            grupo: "Residencial" },
  { id: 5,  label: "Loft",                    value: "Loft",                    grupo: "Residencial" },
  { id: 6,  label: "Penthouse",               value: "Penthouse",               grupo: "Residencial" },
  { id: 7,  label: "Studio",                  value: "Studio",                  grupo: "Residencial" },
  { id: 8,  label: "Casa de playa",           value: "Casa de playa",           grupo: "Residencial" },
  { id: 9,  label: "Cabaña / Glamping",       value: "Cabaña / Glamping",       grupo: "Residencial" },
  // --- Comercial ---
  { id: 10, label: "Local comercial",         value: "Local comercial",         grupo: "Comercial" },
  { id: 11, label: "Plaza comercial",         value: "Plaza comercial",         grupo: "Comercial" },
  { id: 12, label: "Centro comercial",        value: "Centro comercial",        grupo: "Comercial" },
  { id: 13, label: "Restaurante",             value: "Restaurante",             grupo: "Comercial" },
  { id: 14, label: "Dark kitchen",            value: "Dark kitchen",            grupo: "Comercial" },
  // --- Oficinas ---
  { id: 15, label: "Oficina corporativa",     value: "Oficina corporativa",     grupo: "Oficinas" },
  { id: 16, label: "Coworking / Flex",        value: "Coworking / Flex",        grupo: "Oficinas" },
  { id: 17, label: "Consultorio",             value: "Consultorio",             grupo: "Oficinas" },
  // --- Industrial ---
  { id: 18, label: "Bodega logística",        value: "Bodega logística",        grupo: "Industrial" },
  { id: 19, label: "Centro de distribución", value: "Centro de distribución",  grupo: "Industrial" },
  { id: 20, label: "Nave industrial",         value: "Nave industrial",         grupo: "Industrial" },
  { id: 21, label: "Parque industrial",       value: "Parque industrial",       grupo: "Industrial" },
  // --- Hospitalidad ---
  { id: 22, label: "Hotel",                   value: "Hotel",                   grupo: "Hospitalidad" },
  { id: 23, label: "Boutique hotel",          value: "Boutique hotel",          grupo: "Hospitalidad" },
  { id: 24, label: "Airbnb / Vacation rental",value: "Airbnb / Vacation rental",grupo: "Hospitalidad" },
  // --- Salud ---
  { id: 25, label: "Clínica / Consultorio",   value: "Clínica / Consultorio",   grupo: "Salud" },
  { id: 26, label: "Hospital",                value: "Hospital",                grupo: "Salud" },
  // --- Terrenos ---
  { id: 27, label: "Terreno urbano",          value: "Terreno urbano",          grupo: "Terrenos" },
  { id: 28, label: "Lote residencial",        value: "Lote residencial",        grupo: "Terrenos" },
  { id: 29, label: "Terreno industrial",      value: "Terreno industrial",      grupo: "Terrenos" },
  { id: 30, label: "Terreno agropecuario",    value: "Terreno agropecuario",    grupo: "Terrenos" },
];

/**
 * Categorías de proyecto de desarrollo inmobiliario.
 * Define el MODELO de desarrollo, no el tipo de inmueble.
 * El tipo de inmueble se determina en el paso de Taxonomía.
 */
export const TYPES_OF_DEVELOPMENTS = [
  { id: 1, label: "Vertical",             value: "Vertical",             descripcion: "Torres, edificios de departamentos, condominios en altura" },
  { id: 2, label: "Horizontal",           value: "Horizontal",           descripcion: "Fraccionamientos, privadas, conjuntos de casas" },
  { id: 3, label: "Uso Mixto",            value: "Uso Mixto",            descripcion: "Combina residencial, comercial y/u oficinas" },
  { id: 4, label: "Parque Industrial",    value: "Parque Industrial",    descripcion: "Conjunto de naves, bodegas y áreas de manufactura" },
  { id: 5, label: "Master Plan",          value: "Master Plan",          descripcion: "Desarrollo integral de gran escala con múltiples usos" },
  { id: 6, label: "Comercial / Retail",   value: "Comercial / Retail",   descripcion: "Plazas, centros comerciales, strips de locales" },
  { id: 7, label: "Hotelero / Turístico", value: "Hotelero / Turístico", descripcion: "Hoteles, resorts, desarrollos vacacionales" },
  { id: 8, label: "Oficinas Corporativas",value: "Oficinas Corporativas",descripcion: "Edificios de oficinas, campus corporativos" },
  { id: 9, label: "Reconversión / Retrofit", value: "Reconversión / Retrofit", descripcion: "Rehabilitación de inmueble existente con nuevo uso" },
];

export const TYPES_OF_USES = [
  { id: 1, label: "Residencial", value: 1 },
  { id: 2, label: "Comercial", value: 2 },
  { id: 3, label: "Industrial", value: 3 },
  { id: 4, label: "Mixto", value: 4 },
];

export const STATES: { id: number; label: string }[] = [
  { id: 1, label: "Aguascalientes" },
  { id: 2, label: "Baja California" },
  { id: 3, label: "Baja California Sur" },
  { id: 4, label: "Campeche" },
  { id: 5, label: "Chiapas" },
  { id: 6, label: "Chihuahua" },
  { id: 7, label: "Ciudad de México" },
  { id: 8, label: "Coahuila de Zaragoza" },
  { id: 9, label: "Colima" },
  { id: 10, label: "Durango" },
  { id: 11, label: "Guanajuato" },
  { id: 12, label: "Guerrero" },
  { id: 13, label: "Hidalgo" },
  { id: 14, label: "Jalisco" },
  { id: 15, label: "México" },
  { id: 16, label: "Michoacán de Ocampo" },
  { id: 17, label: "Morelos" },
  { id: 18, label: "Nayarit" },
  { id: 19, label: "Nuevo León" },
  { id: 20, label: "Oaxaca" },
  { id: 21, label: "Puebla" },
  { id: 22, label: "Querétaro" },
  { id: 23, label: "Quintana Roo" },
  { id: 24, label: "San Luis Potosí" },
  { id: 25, label: "Sinaloa" },
  { id: 26, label: "Sonora" },
  { id: 27, label: "Tabasco" },
  { id: 28, label: "Tamaulipas" },
  { id: 29, label: "Tlaxcala" },
  { id: 30, label: "Veracruz de Ignacio de la Llave" },
  { id: 31, label: "Yucatán" },
  { id: 32, label: "Zacatecas" },
];

export const CITIES: { id: number; id_estado: number; label: string }[] = [
  { id: 1, id_estado: 1, label: "Aguascalientes" },
  { id: 2, id_estado: 1, label: "Calvillo" },
  { id: 3, id_estado: 1, label: "Jesús María" },
  { id: 4, id_estado: 2, label: "Mexicali" },
  { id: 5, id_estado: 2, label: "Tijuana" },
  { id: 6, id_estado: 2, label: "Ensenada" },
  { id: 7, id_estado: 3, label: "La Paz" },
  { id: 8, id_estado: 3, label: "Los Cabos" },
  { id: 9, id_estado: 3, label: "Loreto" },
  { id: 10, id_estado: 4, label: "Campeche" },
  { id: 11, id_estado: 4, label: "Ciudad del Carmen" },
  { id: 12, id_estado: 4, label: "Champotón" },
  { id: 13, id_estado: 5, label: "Tuxtla Gutiérrez" },
  { id: 14, id_estado: 5, label: "San Cristóbal de las Casas" },
  { id: 15, id_estado: 5, label: "Tapachula" },
  { id: 16, id_estado: 6, label: "Chihuahua" },
  { id: 17, id_estado: 6, label: "Ciudad Juárez" },
  { id: 18, id_estado: 6, label: "Delicias" },
  { id: 19, id_estado: 7, label: "Ciudad de México" },
  { id: 20, id_estado: 8, label: "Saltillo" },
  { id: 21, id_estado: 8, label: "Torreón" },
  { id: 22, id_estado: 8, label: "Monclova" },
  { id: 23, id_estado: 9, label: "Colima" },
  { id: 24, id_estado: 9, label: "Manzanillo" },
  { id: 25, id_estado: 9, label: "Tecomán" },
  { id: 26, id_estado: 10, label: "Durango" },
  { id: 27, id_estado: 10, label: "Gómez Palacio" },
  { id: 28, id_estado: 10, label: "Lerdo" },
  { id: 29, id_estado: 11, label: "Guanajuato" },
  { id: 30, id_estado: 11, label: "León" },
  { id: 31, id_estado: 11, label: "Irapuato" },
  { id: 32, id_estado: 12, label: "Chilpancingo" },
  { id: 33, id_estado: 12, label: "Acapulco" },
  { id: 34, id_estado: 12, label: "Iguala" },
  { id: 35, id_estado: 13, label: "Pachuca" },
  { id: 36, id_estado: 13, label: "Tulancingo" },
  { id: 37, id_estado: 13, label: "Tula" },
  { id: 38, id_estado: 14, label: "Guadalajara" },
  { id: 39, id_estado: 14, label: "Zapopan" },
  { id: 40, id_estado: 14, label: "Puerto Vallarta" },
  { id: 41, id_estado: 15, label: "Toluca" },
  { id: 42, id_estado: 15, label: "Ecatepec" },
  { id: 43, id_estado: 15, label: "Naucalpan" },
  { id: 44, id_estado: 16, label: "Morelia" },
  { id: 45, id_estado: 16, label: "Uruapan" },
  { id: 46, id_estado: 16, label: "Zamora" },
  { id: 47, id_estado: 17, label: "Cuernavaca" },
  { id: 48, id_estado: 17, label: "Cuautla" },
  { id: 49, id_estado: 17, label: "Jiutepec" },
  { id: 50, id_estado: 18, label: "Tepic" },
  { id: 51, id_estado: 18, label: "Bahía de Banderas" },
  { id: 52, id_estado: 18, label: "Compostela" },
  { id: 53, id_estado: 19, label: "Monterrey" },
  { id: 54, id_estado: 19, label: "San Nicolás de los Garza" },
  { id: 55, id_estado: 19, label: "Guadalupe" },
  { id: 56, id_estado: 20, label: "Oaxaca de Juárez" },
  { id: 57, id_estado: 20, label: "Salina Cruz" },
  { id: 58, id_estado: 20, label: "Juchitán" },
  { id: 59, id_estado: 21, label: "Puebla" },
  { id: 60, id_estado: 21, label: "Tehuacán" },
  { id: 61, id_estado: 21, label: "San Martín Texmelucan" },
  { id: 62, id_estado: 22, label: "Santiago de Querétaro" },
  { id: 63, id_estado: 22, label: "San Juan del Río" },
  { id: 64, id_estado: 22, label: "El Marqués" },
  { id: 65, id_estado: 23, label: "Cancún" },
  { id: 66, id_estado: 23, label: "Playa del Carmen" },
  { id: 67, id_estado: 23, label: "Chetumal" },
  { id: 68, id_estado: 24, label: "San Luis Potosí" },
  { id: 69, id_estado: 24, label: "Ciudad Valles" },
  { id: 70, id_estado: 24, label: "Matehuala" },
  { id: 71, id_estado: 25, label: "Culiacán" },
  { id: 72, id_estado: 25, label: "Mazatlán" },
  { id: 73, id_estado: 25, label: "Los Mochis" },
  { id: 74, id_estado: 26, label: "Hermosillo" },
  { id: 75, id_estado: 26, label: "Ciudad Obregón" },
  { id: 76, id_estado: 26, label: "Nogales" },
  { id: 77, id_estado: 27, label: "Villahermosa" },
  { id: 78, id_estado: 27, label: "Cárdenas" },
  { id: 79, id_estado: 27, label: "Comalcalco" },
  { id: 80, id_estado: 28, label: "Ciudad Victoria" },
  { id: 81, id_estado: 28, label: "Reynosa" },
  { id: 82, id_estado: 28, label: "Matamoros" },
  { id: 83, id_estado: 29, label: "Tlaxcala" },
  { id: 84, id_estado: 29, label: "Apizaco" },
  { id: 85, id_estado: 29, label: "Huamantla" },
  { id: 86, id_estado: 30, label: "Xalapa" },
  { id: 87, id_estado: 30, label: "Veracruz" },
  { id: 88, id_estado: 30, label: "Coatzacoalcos" },
  { id: 89, id_estado: 31, label: "Mérida" },
  { id: 90, id_estado: 31, label: "Valladolid" },
  { id: 91, id_estado: 31, label: "Tizimín" },
  { id: 92, id_estado: 32, label: "Zacatecas" },
  { id: 93, id_estado: 32, label: "Fresnillo" },
  { id: 94, id_estado: 32, label: "Guadalupe" },
];

export const AMENITIES = [
  { id: 5, nombre: "Alberca" },
  { id: 11, nombre: "Asador" },
  { id: 4, nombre: "Asoleadero" },
  { id: 2, nombre: "Business Center" },
  { id: 6, nombre: "CoWorking" },
  { id: 3, nombre: "Elevador" },
  { id: 9, nombre: "Estacionamiento de Visitantes" },
  { id: 1, nombre: "Gimnasio" },
  { id: 8, nombre: "Salón de eventos" },
  { id: 7, nombre: "Terraza" },
  { id: 10, nombre: "Vigilancia 24 Hrs" },
  { id: 12, nombre: "Zona de Mascotas" },
  { id: 13, nombre: "Zonas Verdes" },
];

export const TYPES_STATUS_REQUEST = [
  { id: 1, value: "nueva", label: "Nueva" },
  { id: 2, value: "en_proceso", label: "En Proceso" },
  { id: 3, value: "completada", label: "Completada" },
  { id: 4, value: "cancelada", label: "Cancelada" },
];

export const TABS_CRM = [
  { value: "crm", label: "CRM", href: "/crm" },
  { value: "propiedades", label: "Propiedades", href: "/crm/properties" },
  { value: "clientes", label: "Clientes", href: "/crm/clients" },
  // { value: "inquilinos", label: "Inquilinos", href: "/crm/tenants" },
  { value: "ofertas", label: "Ofertas", href: "/crm/offers" },
  { value: "calendario", label: "Calendario", href: "/crm/calendar" },
];

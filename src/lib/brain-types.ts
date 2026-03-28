/**
 * brain-types.ts
 * TypeScript types for all Brain API responses and inputs.
 * Derived from HOMEPTY_NEW_INTEGRATION_GUIDE.md §4.1–§4.14
 */

// ============================================================
// COMMON
// ============================================================

export interface UserIdentity {
    email?: string;
    globalUserId?: string;
    platformUserId?: string;
    platform: "homepty_new";
    activities?: string[];
    anonymousId?: string;
}

export interface BrainResponse<T> {
    ok: boolean;
    data: T;
    message?: string;
}

// ============================================================
// VALUEWEB — Estimaciones de Valor de Mercado (§4.3)
// ============================================================

export interface ValuewebEstimateInput {
    lat: number;
    lon: number;
    direccion: string;
    radius?: number;
    tipo_inmueble?: 2 | 3 | 4;
    clase_inmueble?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
    vivienda_nueva_usada?: "Nueva" | "Usada";
    habitaciones?: number;
    banos?: number;
    estacionamientos?: number;
    num_pisos?: number;
    superficie_construida?: number;
    tamano_terreno?: number;
    antiguedad_anos?: number;
    email?: string;
    nombre?: string;
}

export interface ValuewebComparable {
    clave_avaluo: string;
    fecha_avaluo: string;
    tipo_inmueble: string;
    clase_inmueble: string;
    colonia: string;
    superficie_construida: number;
    superficie_terreno: number;
    recamaras: number;
    banos: number;
    estacionamiento: number;
    distancia_metros: number;
    valor_m2: number;
    valor_final: number;
    antiguedad_anos: number;
    vivienda_nueva_o_usada: string;
    geometria: { lat: number; lon: number };
}

export interface ValuewebEstimateResult {
    valor_promedio: number | null;
    valor_promedio_m2: number | null;
    inmuebles: ValuewebComparable[];
    message: string;
    search_params: Record<string, unknown>;
    data?: {
        mensaje?: string;
        estadisticas?: {
            total_avaluos_encontrados?: number;
            avaluos_por_anio_y_clase_inmueble?: Record<string, Record<string, number>>;
            avaluos_nueva_vs_usada?: Record<string, number>;
        };
    };
}

// ============================================================
// METRIC ANALYSIS — Chat AI y Valuación Avanzada (§4.4)
// ============================================================

export interface MetricAnalysisChatInitInput {
    name: string;
    email: string;
    userIdentity: UserIdentity;
    metadata?: Record<string, unknown>;
}

export interface MetricAnalysisChatInitResult {
    sessionId: string;
    message: string;
    status: "success" | "error";
}

export interface MetricAnalysisChatSendInput {
    sessionId: string;
    message: string;
    userIdentity: UserIdentity;
}

export interface MetricAnalysisChatSendResult {
    sessionId: string;
    response: string;
    isComplete: boolean;
    status: string;
}

export interface MetricAnalysisValuationInput {
    userIdentity: UserIdentity;
    lat: number;
    lon: number;
    radius: number;
    direccion: string;
    tipo_inmueble: 1 | 2 | 3 | 4;
    clase_inmueble: 1 | 2 | 3 | 4;
    vivienda_nueva_usada: "Nueva" | "Usada";
    habitaciones: number;
    banos: number;
    estacionamientos: number;
    superficie_construida: number;
    antiguedad_anos: number;
}

// ============================================================
// ML — Modelos de Machine Learning (§4.5)
// ============================================================

export interface PropertyFeaturesInput {
    areaM2: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    yearBuilt: number;
    latitude: number;
    longitude: number;
    zoneDensity: number;
    proximityToMetro: number;
    proximityToSchools: number;
    proximityToParks: number;
    proximityToCommerce: number;
    floodRisk: number;
    crimeRate: number;
    avgIncomeZone: number;
    propertyTaxRate: number;
    macroInflation: number;
    macroInterestRate: number;
    macroGDP: number;
}

export interface ValuationPrediction {
    predictedPrice: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
}

export interface InvestmentPrediction {
    roi: number;
    capRate: number;
    investmentScore: number;
    riskLevel: string;
    recommendation: string;
}

export interface RentalPrediction {
    nextMonthRent: number;
    nextQuarterRent: number;
    nextYearRent: number;
    volatility: number;
    seasonalityFactor: number;
    forecasts: unknown[];
}

export interface RecommendationInput {
    userId: string;
    priceRange: [number, number];
    areaRange: [number, number];
    bedroomPreference: number;
    locations: string[];
    amenities: string[];
    topK?: number;
}

export interface Recommendation {
    propertyId: string;
    score: number;
    reason: string;
}

export interface MarketInsight {
    id: string;
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact: string;
}

// ============================================================
// AI — Servicios de IA / LLM (§4.12)
// ============================================================

export interface AIValuationInterpretationInput {
    propertyId: string;
    result: {
        predictedPrice: number;
        confidence: number;
        lowerBound: number;
        upperBound: number;
    };
}

export interface AIInvestmentInterpretationInput {
    propertyId: string;
    result: {
        roi: number;
        capRate: number;
        cashFlowMonthly?: number;
        riskLevel: string;
        recommendation: string;
    };
}

export interface AIModelPredictionInput {
    modelName: Record<string, unknown>;
    prediction: Record<string, unknown>;
    features: Record<string, unknown>;
}

export interface AIModelPredictionResult {
    explanation: string;
    modelName: string;
    timestamp: string;
}

export interface AIConversationalSearchInput {
    query: string;
    context?: {
        userId?: string;
        previousQueries?: string[];
        filters?: Record<string, unknown>;
    };
}

export interface AIConversationalSearchResult {
    query: string;
    interpretation: {
        intent: string;
        entities: Record<string, unknown>;
        confidence: number;
    };
    response: string;
    timestamp: string;
}

export interface AIMarketDataInput {
    marketData: Record<string, unknown>;
}

export interface AIPropertyGenerationInput {
    propertyId: string;
    propertyData: Record<string, unknown>;
    targetAudience?: string;
    tone?: string;
}

// ============================================================
// ANALYSIS — Análisis Integral (§4.6)
// ============================================================

export interface ComprehensiveValuationInput {
    latitude: number;
    longitude: number;
    superficie_m2: number;
    tipo_propiedad: string;
    estado_id?: number;
    municipio_id?: number;
    zona_id?: number | null;
}

export interface ComprehensiveValuationResult {
    valuation_id: string;
    timestamp: string;
    location: { latitude: number; longitude: number };
    estado: string;
    municipio: string;
    zona: string;
    precio_final: number;
    precio_m2: number;
    macro_context: Record<string, unknown>;
    financial_valuation: Record<string, unknown>;
    spatial_analysis: Record<string, unknown>;
    geospatial_context: Record<string, unknown>;
    integration_metrics: Record<string, unknown>;
    recommendation: "COMPRAR" | "VENDER" | "ESPERAR";
    recommendation_confidence: number;
    key_insights: string[];
    risk_factors: string[];
    metadata: Record<string, unknown>;
}

export interface ZoneAnalysisInput {
    lat: number;
    lng: number;
    radius_km?: number;
    años?: number;
}

export interface ZoneAnalysisResult {
    opportunity_score: number;
    infrastructure_projects: unknown[];
    zone_metrics: Record<string, unknown>;
    financiamientos: unknown[];
    recommendations: string[];
}

export interface PropertyContextInput {
    property_lat: number;
    property_lng: number;
    property_price?: number;
    analysis_radius?: number;
}

export interface PropertyContextResult {
    valorization_analysis: Record<string, unknown>;
    nearby_infrastructure: unknown[];
    financing_opportunities: unknown[];
    impact_projects: unknown[];
}

// ============================================================
// FEATURE STORE (§4.7)
// ============================================================

export interface UserFeaturesInput {
    userId: string;
    searchCount30d: number;
    avgPriceSearched?: number;
    preferredZoneId?: number;
    interactionCount: number;
}

export interface PropertyFeaturesStoreInput {
    propertyId: string;
    zoneId: number;
    latitude?: number;
    longitude?: number;
    propertyType?: string;
    areaSqm?: number;
    sizeScore?: number;
    amenitiesScore?: number;
    locationScore?: number;
}

export interface EnrichPropertyTaxonomyInput {
    propertyId: string;
    zoneId: number;
    verticalId?: number;
    segmentId?: number;
    subsegmentId?: number;
    areaSqm?: number;
    latitude?: number;
    longitude?: number;
}

export interface EnrichmentResult {
    success: boolean;
    data: {
        propertyId: string;
        taxonomyEmbeddingDims: number;
        taxonomyPriceAdjustment: number;
        verticalId?: number;
        segmentId?: number;
        subsegmentId?: number;
    };
}

// ============================================================
// FINANCIAL (§4.8)
// ============================================================

export interface FinancialValuationInput {
    propertyId: string;
    purchasePrice: number;
    annualRentalIncome: number;
    operatingExpenses: number;
    capitalExpenditure: number;
    holdingPeriod: number;
    exitCapRate: number;
    discountRate: number;
    inflationRate?: number;
}

export type ScenarioType = "base" | "optimista" | "pesimista" | "critico" | "boom";

export interface ScenarioParameters {
    appreciation: number;
    vacancy: number;
    capRate: number;
    rentGrowth: number;
    inflationAdjustment: number;
    riskPremium: number;
    macroData: {
        inflationRate: number;
        interestRate: number;
    };
}

// ============================================================
// SEARCH (§4.11)
// ============================================================

export interface SearchEmbeddingInput {
    propertyId: string;
    zoneId: number;
    locationScore: number;
    amenitiesScore: number;
    sizeScore: number;
    accessibilityScore: number;
    investmentPotential: number;
}

export interface SimilarProperty {
    propertyId: string;
    zoneId: number;
    similarity: number;
}

// ============================================================
// COPILOT CONTEXT
// ============================================================

export interface CopilotContext {
    currentModule: string;
    userProfile?: {
        id: string;
        email: string;
        nombre: string | null;
        actividad: string | null;
    };
    crmStats?: {
        totalPropiedades: number;
        propiedadesVenta: number;
        propiedadesRenta: number;
        totalClientes: number;
        totalOfertas: number;
        ofertasPendientes: number;
    };
    activeProperty?: {
        id: number;
        nombre: string;
        tipo: string;
        precio: number;
        direccion: string;
    };
    activeClient?: {
        id: number;
        nombre: string;
        email: string;
    };
    recentActivity?: string[];
}

export interface CopilotMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    isComplete: boolean;
    title?: string;
}

export interface CopilotSession {
    id: string;
    sessionId: string;
    title: string;
    messages: CopilotMessage[];
    updatedAt: string;
}

// ============================================================
// WEBSOCKET CHAT MESSAGES (§6)
// ============================================================

export type WSClientMessage =
    | { type: "chat_init"; name: string; email: string; userIdentity: UserIdentity; metadata?: Record<string, unknown> }
    | { type: "chat_message"; sessionId: string; message: string; userIdentity: UserIdentity }
    | { type: "chat_close"; sessionId: string };

export type WSServerMessage =
    | { type: "chat_init_success"; sessionId: string; message: string }
    | { type: "chat_message_chunk"; sessionId: string; content: string; isComplete: boolean }
    | { type: "chat_complete"; sessionId: string }
    | { type: "error"; sessionId?: string; message: string };

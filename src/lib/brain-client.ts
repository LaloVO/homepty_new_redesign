/**
 * brain-client.ts
 * Cliente HTTP completo para el Brain API (homepty-brain-v1)
 *
 * Superficie de comunicación:
 * - tRPC API: https://ml.homepty.com/api/trpc/<router>.<procedure>
 * - REST API: https://ml.homepty.com/api/rest/<path>
 *
 * Autenticación:
 * - publicProcedure: sin auth (taxonomy, ml, analysis, featureStore, financial, spatial, geospatial, search)
 * - apiKeyProcedure: Authorization: Bearer <HOMEPTY_BRAIN_API_KEY> (valueweb, metricAnalysis, ai)
 *
 * Configuración env:
 * - NEXT_PUBLIC_BRAIN_URL: URL base tRPC (https://ml.homepty.com/api/trpc)
 * - HOMEPTY_BRAIN_API_KEY: API Key para endpoints protegidos (server-side only)
 * - HOMEPTY_BRAIN_REST_URL: URL base REST (https://ml.homepty.com/api/rest)
 */

import type {
  // Valueweb
  ValuewebEstimateInput,
  ValuewebEstimateResult,
  // Metric Analysis
  MetricAnalysisChatInitInput,
  MetricAnalysisChatInitResult,
  MetricAnalysisChatSendInput,
  MetricAnalysisChatSendResult,
  MetricAnalysisValuationInput,
  // ML
  PropertyFeaturesInput,
  ValuationPrediction,
  InvestmentPrediction,
  RecommendationInput,
  Recommendation,
  MarketInsight,
  // AI
  AIValuationInterpretationInput,
  AIInvestmentInterpretationInput,
  AIModelPredictionInput,
  AIModelPredictionResult,
  AIConversationalSearchInput,
  AIConversationalSearchResult,
  AIMarketDataInput,
  AIPropertyGenerationInput,
  // Analysis
  ComprehensiveValuationInput,
  ComprehensiveValuationResult,
  ZoneAnalysisInput,
  ZoneAnalysisResult,
  PropertyContextInput,
  PropertyContextResult,
  // Feature Store
  UserFeaturesInput,
  PropertyFeaturesStoreInput,
  EnrichPropertyTaxonomyInput,
  EnrichmentResult,
  // Financial
  FinancialValuationInput,
  ScenarioType,
  ScenarioParameters,
  // Search
  SearchEmbeddingInput,
  SimilarProperty,
} from "./brain-types";

// ============================================================
// TAXONOMY TYPES (defined locally, used by brainTaxonomy)
// ============================================================

export interface TaxVertical {
  id: number;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  activo: boolean;
  segments: TaxSegment[];
}

export interface TaxSegment {
  id: number;
  verticalId: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  subsegments: TaxSubsegment[];
}

export interface TaxSubsegment {
  id: number;
  segmentId: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface TaxAttribute {
  id: number;
  nombre: string;
  clave: string;
  tipoDato: "integer" | "decimal" | "boolean" | "enum" | "text";
  opcionesEnum: string[] | null;
  esGlobal: boolean;
  subsegmentId: number | null;
  requerido: boolean;
  unidad: string | null;
  orden: number;
}

export interface TaxonomyTree {
  verticals: TaxVertical[];
}

export interface AttributesBySubsegment {
  global: TaxAttribute[];
  specialized: TaxAttribute[];
}

// ============================================================
// CONFIGURATION
// ============================================================

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL;
const BRAIN_API_KEY = process.env.HOMEPTY_BRAIN_API_KEY;
const BRAIN_REST_URL = process.env.HOMEPTY_BRAIN_REST_URL;

// ============================================================
// BASE FETCH UTILITIES
// ============================================================

/**
 * GET request to Brain tRPC (publicProcedure — no auth)
 */
async function brainFetch<T>(path: string): Promise<T> {
  if (!BRAIN_URL) {
    throw new Error("NEXT_PUBLIC_BRAIN_URL no está configurada");
  }

  const response = await fetch(`${BRAIN_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Brain API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // tRPC + SuperJSON wraps actual payload inside result.data.json
  return data.result?.data?.json ?? data.result?.data ?? data;
}

/**
 * GET request to Brain tRPC (apiKeyProcedure — requires auth)
 */
async function brainFetchAuthed<T>(path: string): Promise<T> {
  if (!BRAIN_URL) {
    throw new Error("NEXT_PUBLIC_BRAIN_URL no está configurada");
  }
  if (!BRAIN_API_KEY) {
    throw new Error("HOMEPTY_BRAIN_API_KEY no está configurada");
  }

  const response = await fetch(`${BRAIN_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${BRAIN_API_KEY}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `Brain API error (authed): ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // tRPC + SuperJSON wraps actual payload inside result.data.json
  return data.result?.data?.json ?? data.result?.data ?? data;
}

/**
 * POST mutation to Brain tRPC (publicProcedure)
 * tRPC serializa el body como { json: <input> } con SuperJSON
 */
async function brainMutation<T>(
  path: string,
  body: unknown
): Promise<T> {
  if (!BRAIN_URL) {
    throw new Error("NEXT_PUBLIC_BRAIN_URL no está configurada");
  }

  const response = await fetch(`${BRAIN_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ json: body }),
  });

  if (!response.ok) {
    throw new Error(
      `Brain API mutation error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // tRPC + SuperJSON wraps actual payload inside result.data.json
  return data.result?.data?.json ?? data.result?.data ?? data;
}

/**
 * POST mutation to Brain tRPC (apiKeyProcedure — requires auth)
 */
async function brainMutationAuthed<T>(
  path: string,
  body: unknown
): Promise<T> {
  if (!BRAIN_URL) {
    throw new Error("NEXT_PUBLIC_BRAIN_URL no está configurada");
  }
  if (!BRAIN_API_KEY) {
    throw new Error("HOMEPTY_BRAIN_API_KEY no está configurada");
  }

  const response = await fetch(`${BRAIN_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${BRAIN_API_KEY}`,
    },
    body: JSON.stringify({ json: body }),
  });

  if (!response.ok) {
    throw new Error(
      `Brain API mutation error (authed): ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // tRPC + SuperJSON wraps actual payload inside result.data.json
  return data.result?.data?.json ?? data.result?.data ?? data;
}

/**
 * GET request to Brain REST API (no auth)
 */
async function brainRestFetch<T>(path: string): Promise<T> {
  if (!BRAIN_REST_URL) {
    throw new Error("HOMEPTY_BRAIN_REST_URL no está configurada");
  }

  const response = await fetch(`${BRAIN_REST_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Brain REST API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ============================================================
// TAXONOMY — publicProcedure (§4.2)
// ============================================================

export const brainTaxonomy = {
  async getTree(): Promise<TaxonomyTree> {
    return brainFetch<TaxonomyTree>("/taxonomy.getTree");
  },

  async getSegmentsByVertical(
    verticalId: number
  ): Promise<{ ok: boolean; data: TaxSegment[] }> {
    return brainFetch(`/taxonomy.getSegmentsByVertical?input=${JSON.stringify({ json: { verticalId } })}`);
  },

  async getTipologiasByVertical(verticalId: number) {
    return brainFetch(`/taxonomy.getTipologiasByVertical?input=${JSON.stringify({ json: { verticalId } })}`);
  },

  async getSubsegmentsBySegment(
    segmentId: number
  ): Promise<{ ok: boolean; data: TaxSubsegment[] }> {
    return brainFetch(`/taxonomy.getSubsegmentsBySegment?input=${JSON.stringify({ json: { segmentId } })}`);
  },

  async getAttributesBySubsegment(
    subsegmentId: number
  ): Promise<AttributesBySubsegment> {
    return brainFetch<AttributesBySubsegment>(
      `/taxonomy.getAttributesBySubsegment?input=${JSON.stringify({ json: { subsegmentId } })}`
    );
  },

  async savePropertyTaxonomy(params: {
    propertyId: string;
    verticalId?: number;
    segmentId?: number;
    tipologiaId?: number;
    subsegmentId?: number;
  }): Promise<{ ok: boolean; message: string }> {
    return brainMutation("/taxonomy.savePropertyTaxonomy", params);
  },

  async savePropertyAttributeValues(params: {
    propertyId: string;
    values: Array<{
      attributeId: number;
      valor: string | number | boolean | null;
    }>;
  }): Promise<{ ok: boolean; message: string }> {
    return brainMutation("/taxonomy.savePropertyAttributeValues", params);
  },

  async getPropertyTaxonomy(propertyId: string) {
    return brainFetch(`/taxonomy.getPropertyTaxonomy?input=${JSON.stringify({ json: { propertyId } })}`);
  },

  async getVerticals(): Promise<TaxVertical[]> {
    const data = await brainFetch<{ verticals: TaxVertical[] }>(
      "/taxonomy.getTree"
    );
    return data.verticals;
  },
};

// ============================================================
// VALUEWEB — apiKeyProcedure (§4.3)
// ============================================================

export const brainValuacion = {
  async estimate(
    params: ValuewebEstimateInput
  ): Promise<ValuewebEstimateResult> {
    return brainFetchAuthed<ValuewebEstimateResult>(
      `/valueweb.estimate?input=${JSON.stringify({ json: params })}`
    );
  },

  async valuationEstimate(
    params: MetricAnalysisValuationInput
  ): Promise<ValuewebEstimateResult> {
    return brainMutationAuthed<ValuewebEstimateResult>(
      "/metricAnalysis.valuationEstimate",
      params
    );
  },

  async config(): Promise<{
    configured: boolean;
    apiUrl: string;
    hasApiKey: boolean;
  }> {
    return brainFetchAuthed("/valueweb.config");
  },

  async enums(): Promise<{
    tipoInmueble: Record<string, number>;
    claseInmueble: Record<string, number>;
  }> {
    return brainFetchAuthed("/valueweb.enums");
  },
};

// ============================================================
// METRIC ANALYSIS — apiKeyProcedure (§4.4)
// ============================================================

export const brainMetricAnalysis = {
  async chatInit(
    params: MetricAnalysisChatInitInput
  ): Promise<MetricAnalysisChatInitResult> {
    return brainMutationAuthed("/metricAnalysis.chatInit", params);
  },

  async chatSend(
    params: MetricAnalysisChatSendInput
  ): Promise<MetricAnalysisChatSendResult> {
    return brainMutationAuthed("/metricAnalysis.chatSend", params);
  },

  async chatSendAsync(params: {
    message: string;
    userIdentity: import("./brain-types").UserIdentity;
    metadata?: Record<string, unknown>;
  }): Promise<{ requestId: string; status: "processing" }> {
    return brainMutationAuthed("/metricAnalysis.chatSendAsync", params);
  },

  async chatPoll(requestId: string): Promise<{
    requestId: string;
    status: "processing" | "complete" | "error";
    response?: string;
    error?: string;
  }> {
    return brainFetchAuthed(
      `/metricAnalysis.chatPoll?input=${JSON.stringify({ json: { requestId } })}`
    );
  },

  async config() {
    return brainFetchAuthed("/metricAnalysis.config");
  },

  async stats(platform: "homepty_welcome" | "homepty_new" | "homepty_cbf") {
    return brainFetchAuthed(
      `/metricAnalysis.stats?input=${JSON.stringify({ json: { platform } })}`
    );
  },
};

// ============================================================
// ML — publicProcedure (§4.5)
// ============================================================

export const brainML = {
  valuation: {
    async predict(
      features: PropertyFeaturesInput
    ): Promise<ValuationPrediction> {
      return brainFetch(
        `/ml.valuation.predict?input=${JSON.stringify({ json: features })}`
      );
    },
  },

  investment: {
    async predict(features: unknown): Promise<InvestmentPrediction> {
      return brainFetch(
        `/ml.investment.predict?input=${JSON.stringify({ json: features })}`
      );
    },
    async getFeatureImportance(): Promise<
      Array<{ feature: string; importance: number }>
    > {
      return brainFetch("/ml.investment.getFeatureImportance");
    },
  },

  rental: {
    async predict(
      data: Array<{
        timestamp: string;
        rentalPrice: number;
        occupancyRate: number;
        demand: number;
      }>
    ) {
      return brainFetch(
        `/ml.rental.predict?input=${JSON.stringify({ json: data })}`
      );
    },
  },

  recommendations: {
    async generate(
      params: RecommendationInput
    ): Promise<{ userId: string; recommendations: Recommendation[] }> {
      return brainFetch(
        `/ml.recommendations.generate?input=${JSON.stringify({ json: params })}`
      );
    },
  },

  async getMarketInsights(): Promise<MarketInsight[]> {
    return brainFetch("/ml.getMarketInsights");
  },

  models: {
    async listModels() {
      return brainFetch("/ml.models.listModels");
    },
    async getModelInfo(modelName: string) {
      return brainFetch(
        `/ml.models.getModelInfo?input=${JSON.stringify({ json: { modelName } })}`
      );
    },
  },
};

// ============================================================
// AI — apiKeyProcedure (§4.12) — LLM via Manus Forge/Gemini
// ============================================================

export const brainAI = {
  interpretation: {
    async valuation(params: AIValuationInterpretationInput): Promise<string> {
      return brainFetchAuthed(
        `/ai.interpretation.valuation?input=${JSON.stringify({ json: params })}`
      );
    },
    async investment(params: AIInvestmentInterpretationInput): Promise<string> {
      return brainFetchAuthed(
        `/ai.interpretation.investment?input=${JSON.stringify({ json: params })}`
      );
    },
    async modelPrediction(
      params: AIModelPredictionInput
    ): Promise<AIModelPredictionResult> {
      return brainFetchAuthed(
        `/ai.interpretation.modelPrediction?input=${JSON.stringify({ json: params })}`
      );
    },
  },

  conversational: {
    async search(
      params: AIConversationalSearchInput
    ): Promise<AIConversationalSearchResult> {
      return brainFetchAuthed(
        `/ai.conversational.search?input=${JSON.stringify({ json: params })}`
      );
    },
  },

  market: {
    async detectAnomalies(params: AIMarketDataInput) {
      return brainFetchAuthed(
        `/ai.market.detectAnomalies?input=${JSON.stringify({ json: params })}`
      );
    },
    async identifyOpportunities(params: AIMarketDataInput) {
      return brainFetchAuthed(
        `/ai.market.identifyOpportunities?input=${JSON.stringify({ json: params })}`
      );
    },
    async generateReport(params: AIMarketDataInput) {
      return brainFetchAuthed(
        `/ai.market.generateReport?input=${JSON.stringify({ json: params })}`
      );
    },
  },

  generation: {
    async propertyPitch(params: AIPropertyGenerationInput): Promise<string> {
      return brainFetchAuthed(
        `/ai.generation.propertyPitch?input=${JSON.stringify({ json: params })}`
      );
    },
    async propertyDescription(
      params: AIPropertyGenerationInput
    ): Promise<string> {
      return brainFetchAuthed(
        `/ai.generation.propertyDescription?input=${JSON.stringify({ json: params })}`
      );
    },
  },
};

// ============================================================
// ANALYSIS — publicProcedure (§4.6)
// ============================================================

export const brainAnalysis = {
  async comprehensiveValuation(
    params: ComprehensiveValuationInput
  ): Promise<ComprehensiveValuationResult> {
    return brainFetch(
      `/analysis.comprehensiveValuation?input=${JSON.stringify({ json: params })}`
    );
  },

  async zoneAnalysis(params: ZoneAnalysisInput): Promise<ZoneAnalysisResult> {
    return brainFetch(
      `/analysis.zoneAnalysis?input=${JSON.stringify({ json: params })}`
    );
  },

  async propertyContext(
    params: PropertyContextInput
  ): Promise<PropertyContextResult> {
    return brainFetch(
      `/analysis.propertyContext?input=${JSON.stringify({ json: params })}`
    );
  },

  async knnSearch(params: {
    latitude: number;
    longitude: number;
    k_neighbors?: number;
    max_distance_km?: number;
  }) {
    return brainFetch(
      `/analysis.knnSearch?input=${JSON.stringify({ json: params })}`
    );
  },
};

// ============================================================
// FEATURE STORE — publicProcedure (§4.7)
// ============================================================

export const brainFeatureStore = {
  async getUserFeatures(userId: string) {
    return brainFetch(
      `/featureStore.getUserFeatures?input=${JSON.stringify({ json: { userId } })}`
    );
  },

  async saveUserFeatures(
    features: UserFeaturesInput
  ): Promise<{ ok: boolean }> {
    return brainMutation("/featureStore.saveUserFeatures", features);
  },

  async getPropertyFeatures(propertyId: string) {
    return brainFetch(
      `/featureStore.getPropertyFeatures?input=${JSON.stringify({ json: { propertyId } })}`
    );
  },

  async savePropertyFeatures(
    features: PropertyFeaturesStoreInput
  ): Promise<{ ok: boolean }> {
    return brainMutation("/featureStore.savePropertyFeatures", features);
  },

  async enrichPropertyWithTaxonomy(
    params: EnrichPropertyTaxonomyInput
  ): Promise<EnrichmentResult> {
    return brainMutation("/featureStore.enrichPropertyWithTaxonomy", params);
  },

  async invalidateCache(params: {
    entityType: "user" | "property" | "market";
    entityId: string;
  }) {
    return brainMutation("/featureStore.invalidateCache", params);
  },
};

// ============================================================
// FINANCIAL — publicProcedure (§4.8)
// ============================================================

export const brainFinancial = {
  async performValuation(params: FinancialValuationInput) {
    return brainFetch(
      `/financial.performValuation?input=${JSON.stringify({ json: params })}`
    );
  },

  async calculateCapRate(params: { noi: number; propertyValue: number }) {
    return brainFetch(
      `/financial.calculateCapRate?input=${JSON.stringify({ json: params })}`
    );
  },

  async getLatestInflationRate(): Promise<{
    inflationRate: number;
    inflationRatePercentage: number;
  }> {
    return brainFetch("/financial.getLatestInflationRate");
  },

  async getLatestInterestRate(): Promise<{
    interestRate: number;
    interestRatePercentage: number;
  }> {
    return brainFetch("/financial.getLatestInterestRate");
  },

  async getMarketTrends(timeRange: "30d" | "90d" | "365d") {
    return brainFetch(
      `/financial.getMarketTrends?input=${JSON.stringify({ json: { timeRange } })}`
    );
  },

  async getScenarioParameters(
    scenarioType: ScenarioType
  ): Promise<ScenarioParameters> {
    return brainFetch(
      `/financial.getScenarioParameters?input=${JSON.stringify({ json: { scenarioType } })}`
    );
  },
};

// ============================================================
// SEARCH — publicProcedure (§4.11)
// ============================================================

export const brainSearch = {
  properties: {
    async generateEmbedding(params: SearchEmbeddingInput) {
      return brainMutation(
        "/search.properties.generateEmbedding",
        params
      );
    },
    async findSimilar(
      propertyId: string,
      topK?: number
    ): Promise<{
      propertyId: string;
      similarProperties: SimilarProperty[];
      count: number;
    }> {
      return brainFetch(
        `/search.properties.findSimilar?input=${JSON.stringify({ json: { propertyId, topK } })}`
      );
    },
    async searchByEmbedding(embedding: number[], topK?: number) {
      return brainFetch(
        `/search.properties.searchByEmbedding?input=${JSON.stringify({ json: { embedding, topK } })}`
      );
    },
  },
};

// ============================================================
// REST API (§5)
// ============================================================

export const brainRest = {
  async getScenario(
    scenarioType: ScenarioType
  ): Promise<{ success: boolean; data: ScenarioParameters }> {
    return brainRestFetch(`/scenarios/${scenarioType}`);
  },

  async getMarketInsights() {
    return brainRestFetch("/market-insights");
  },

  async getMarketTrends(timeRange: "30d" | "90d" | "365d") {
    return brainRestFetch(`/market-trends?timeRange=${timeRange}`);
  },
};

// ============================================================
// SYSTEM (§4.14)
// ============================================================

export const brainSystem = {
  async health(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }> {
    return brainFetch("/system.health");
  },
};

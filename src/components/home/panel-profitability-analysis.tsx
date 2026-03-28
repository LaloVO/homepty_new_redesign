"use client";

import { useState, useCallback } from "react";
import {
    BarChart3Icon,
    XIcon,
    SparklesIcon,
    HomeIcon,
    DollarSignIcon,
    TrendingUpIcon,
    Building2Icon,
    TargetIcon,
    DatabaseIcon,
    CheckCircle2Icon,
    Loader2,
} from "lucide-react";

interface MarketAnalysisData {
    location: string;
    opportunities: string;
    report: string;
}

interface ProfitabilityAnalysisPanelProps {
    onClose?: () => void;
}

export function ProfitabilityAnalysisPanel({ onClose }: ProfitabilityAnalysisPanelProps) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState<MarketAnalysisData | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch market data from Brain AI through server proxy
            const [opportunitiesRes, reportRes] = await Promise.all([
                fetch("/api/brain/market/opportunities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: query.trim(), location: query.trim() }),
                }),
                fetch("/api/brain/market/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: query.trim(), location: query.trim() }),
                }),
            ]);

            const [opportunities, report] = await Promise.all([
                opportunitiesRes.json(),
                reportRes.json(),
            ]);

            setAnalysisData({
                location: query.trim(),
                opportunities: typeof opportunities === "string"
                    ? opportunities
                    : opportunities.response || opportunities.message || JSON.stringify(opportunities),
                report: typeof report === "string"
                    ? report
                    : report.response || report.message || JSON.stringify(report),
            });
        } catch (err) {
            console.error("[ProfitabilityPanel] Error:", err);
            setError("Error al obtener datos del mercado. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    const handleConversationalSearch = useCallback(async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/brain/conversational", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query.trim() }),
            });

            const data = await res.json();
            setAiResponse(data.response || data.message || "Sin respuesta");
        } catch (err) {
            console.error("[ProfitabilityPanel] Conversational error:", err);
            setError("Error en la búsqueda conversacional.");
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    return (
        <aside className="flex flex-col h-full bg-[#F3F4F6] border-l border-gray-200 overflow-hidden rounded-[24px]">
            {/* HEADER */}
            <div className="p-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3Icon className="text-primary w-6 h-6" />
                    <h2 className="font-bold text-lg">Análisis de Rentabilidad</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            {/* CONTENIDO SCROLL */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-8">
                {/* INPUT IA CON GLOW */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-sm"></div>
                    <div className="relative bg-white border border-gray-100 rounded-xl p-1 flex items-center">
                        <input
                            className="w-full border-none focus:ring-0 text-sm px-3 py-2 bg-transparent text-gray-700 outline-none"
                            placeholder="Investiga con IA, ingresa el nicho..."
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || !query.trim()}
                            className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <SparklesIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 border border-red-100">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs text-gray-400 font-medium">Analizando mercado con IA...</p>
                    </div>
                )}

                {/* Results - Market Analysis */}
                {!isLoading && analysisData && (
                    <>
                        {/* ÁREAS CLAVE */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900">Áreas Clave de Análisis</h3>
                                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                                    Datos reales
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Market Card */}
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3 text-primary">
                                        <HomeIcon className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-wide">
                                            Mercado: {analysisData.location}
                                        </span>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3">
                                            <DollarSignIcon className="text-green-500 w-5 h-5 shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-800">Reporte de Mercado</p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                                                    {analysisData.report.slice(0, 300)}
                                                    {analysisData.report.length > 300 && "..."}
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* OPORTUNIDADES */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TargetIcon className="text-primary w-5 h-5 shrink-0" />
                                Identificación de Oportunidades
                            </h3>

                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-4">
                                <div className="flex gap-3">
                                    <CheckCircle2Icon className="text-green-600 w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {analysisData.opportunities.slice(0, 500)}
                                        {analysisData.opportunities.length > 500 && "..."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RECOMENDACIÓN FINAL */}
                        <div className="pb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900">
                                    Recomendaciones Estratégicas
                                </h3>
                                <span className="text-[9px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-lg font-bold">
                                    Personalizadas
                                </span>
                            </div>

                            <div className="bg-gray-800 rounded-2xl p-4 text-white">
                                <p className="text-[11px] text-gray-300 leading-relaxed mb-4 italic">
                                    &quot;{analysisData.report.slice(0, 200)}&quot;
                                </p>

                                <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-xl transition-all border border-white/20">
                                    Descargar Reporte Completo PDF
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* AI Conversational Response */}
                {!isLoading && aiResponse && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-800 mb-2">Respuesta IA</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {aiResponse}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !analysisData && !aiResponse && !error && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                            <SparklesIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-700">Analiza cualquier mercado</p>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                                Ingresa una zona, ciudad o nicho inmobiliario para obtener análisis en tiempo real.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

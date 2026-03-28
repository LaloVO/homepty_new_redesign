"use client";
import { ProfitabilityAnalysisPanel } from "./panel-profitability-analysis";
import { useAppShell } from "@/hooks";
import { DialogOffers } from "./dialog-offers";
import { DialogValueEstimator } from "./dialog-value-estimator";
import {
    BarChart3Icon,
    SparklesIcon,
    BanknoteIcon,
    ArrowUpRightIcon
} from "lucide-react";


export function QuickActionCards() {
    const { setRightPanelContent } = useAppShell();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
                onClick={() => setRightPanelContent(<ProfitabilityAnalysisPanel onClose={() => setRightPanelContent(null)} />)}
                className="group relative overflow-hidden p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-300 text-left w-full h-full"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <BarChart3Icon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">Análisis de Rentabilidad</h3>
                    </div>
                    <ArrowUpRightIcon className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                </div>
            </button>

            <DialogOffers
                trigger={
                    <button className="group relative overflow-hidden p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all duration-300 text-left w-full h-full">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <SparklesIcon size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">Ofertas Inmobiliarias</h3>
                            </div>
                            <ArrowUpRightIcon className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
                        </div>
                    </button>
                }
            />

            <DialogValueEstimator
                trigger={
                    <button className="group relative overflow-hidden p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50/50 hover:border-purple-200 transition-all duration-300 text-left w-full h-full">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <BanknoteIcon size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">Estimar Valor</h3>
                            </div>
                            <ArrowUpRightIcon className="text-slate-300 group-hover:text-purple-500 transition-colors" size={20} />
                        </div>
                    </button>
                }
            />
        </div>
    );
}

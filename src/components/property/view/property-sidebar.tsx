"use client";

import { PropertyWithImages } from "@/types";
import { CalculatorIcon, ChartLineIcon, CircleCheckIcon, CircleDollarSignIcon } from "lucide-react";
import { formatMoney } from "@/utils/formatters";

interface Props {
    property: PropertyWithImages;
}

export function PropertySidebar({ property }: Props) {
    // Mock calculations for demo purposes
    const downPayment = property.precio * 0.2;
    const loanAmount = property.precio * 0.8;
    const monthlyPayment = (loanAmount * 0.01).toFixed(2); // Rough estimate
    const pricePerSqm = property.area_construida > 0 ? property.precio / property.area_construida : 0;

    // Convert string/number to formatted currency
    const formattedMonthly = formatMoney(Number(monthlyPayment));
    const formattedPrice = formatMoney(property.precio);

    return (
        <div className="h-full bg-[var(--background-light)] overflow-hidden flex flex-col border-l border-slate-200/60">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Credit Simulator Section */}
                <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <CalculatorIcon className="text-primary" size={20} />
                        <h3 className="text-sm font-bold text-slate-800">Simulador de crédito</h3>
                    </div>
                    <div className="text-center mb-6">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                            Enganche estimado (20%)
                        </div>
                        <div className="text-3xl font-bold text-primary">
                            {formatMoney(downPayment)}
                        </div>
                    </div>
                    <div className="space-y-4 text-xs">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Valor de la propiedad:</span>
                            <span className="font-bold text-slate-800">{formattedPrice}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Monto a financiar:</span>
                            <span className="font-bold text-slate-800">{formatMoney(loanAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 mb-4">
                            <span className="text-slate-500">Pago mensual estimado:</span>
                            <span className="font-bold text-slate-800">{formattedMonthly}</span>
                        </div>
                        <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg font-bold border border-slate-100 transition-colors">
                            Solicitar simulación completa
                        </button>
                    </div>
                </section>

                {/* Price Analysis Section */}
                <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ChartLineIcon className="text-primary" size={20} />
                        <h3 className="text-sm font-bold text-slate-800">Análisis de precio</h3>
                    </div>
                    <div className="text-center mb-6 bg-blue-50/50 rounded-xl py-4 border border-blue-100/50">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Precio por m²</div>
                        <div className="text-3xl font-bold text-primary">{formatMoney(pricePerSqm)}</div>
                    </div>
                    <div className="space-y-3 text-xs mb-4">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Área total:</span>
                            <span className="font-bold text-slate-800">{property.area_construida} m²</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Valor estimado:</span>
                            <span className="font-bold text-slate-800">{formattedPrice}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <CircleCheckIcon className="text-slate-400" size={16} />
                        <span className="text-[10px] font-medium text-slate-600">Precio competitivo en la zona</span>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-[10px] text-orange-700 leading-relaxed">
                        Servicio de valuación no disponible. Por favor intente más tarde.
                    </div>
                </section>

                {/* Investment Analysis Section */}
                <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <CircleDollarSignIcon className="text-primary" size={20} />
                        <h3 className="text-sm font-bold text-slate-800">Análisis de inversión</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">ROI estimado</div>
                            <div className="text-lg font-bold text-emerald-600">8.5%</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Plusvalía anual</div>
                            <div className="text-lg font-bold text-primary">12%</div>
                        </div>
                    </div>
                    <button className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-2">
                        <ChartLineIcon size={18} />
                        Solicitar análisis completo
                    </button>
                </section>
            </div>
        </div>
    );
}

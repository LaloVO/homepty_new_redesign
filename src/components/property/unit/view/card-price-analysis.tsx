"use client";

import { usePropertyValuation } from "@/hooks/use-property-valuation";
import { Loader2 } from "lucide-react";

interface Props {
  direccion: string;
  precio: number;
  area: number;
  tipo_inmueble?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CardPriceAnalysis({ direccion, precio, area, tipo_inmueble }: Props) {
  const { data: valuation, isLoading, error } = usePropertyValuation({
    direccion,
    tipo_inmueble: tipo_inmueble ?? 2,
    superficie: area,
    enabled: !!direccion,
  });

  const basicPriceM2 = area > 0 ? precio / area : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h4 className="text-sm font-bold text-gray-800 mb-3">Análisis de Precio</h4>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="ml-2 text-xs text-gray-400">Calculando valuación...</span>
        </div>
      ) : error ? (
        <div className="space-y-2">
          {basicPriceM2 && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Precio por m²</span>
                <span className="font-semibold text-gray-900">{formatCurrency(basicPriceM2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Área</span>
                <span className="font-semibold text-gray-900">{area} m²</span>
              </div>
            </>
          )}
          <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
            ⚠️ Valuación automática no disponible: {error}
          </p>
        </div>
      ) : valuation ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Precio por m²</span>
            <span className="font-semibold text-gray-900">
              {valuation.valor_promedio_m2 ? formatCurrency(valuation.valor_promedio_m2) : basicPriceM2 ? formatCurrency(basicPriceM2) : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Área</span>
            <span className="font-semibold text-gray-900">{area} m²</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Valor estimado</span>
            <span className="font-bold text-primary">
              {valuation.valor_promedio ? formatCurrency(valuation.valor_promedio) : "—"}
            </span>
          </div>
          {valuation.valor_promedio && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">vs Precio listado</span>
              {(() => {
                const diff = ((precio - valuation.valor_promedio) / valuation.valor_promedio) * 100;
                const isOverpriced = diff > 0;
                return (
                  <span className={`font-semibold ${isOverpriced ? "text-red-500" : "text-green-500"}`}>
                    {isOverpriced ? "+" : ""}{diff.toFixed(1)}%
                  </span>
                );
              })()}
            </div>
          )}
          {valuation.inmuebles && valuation.inmuebles.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">
              Basado en {valuation.inmuebles.length} comparables de la zona
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {basicPriceM2 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Precio por m²</span>
              <span className="font-semibold text-gray-900">{formatCurrency(basicPriceM2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Área</span>
            <span className="font-semibold text-gray-900">{area} m²</span>
          </div>
        </div>
      )}
    </div>
  );
}

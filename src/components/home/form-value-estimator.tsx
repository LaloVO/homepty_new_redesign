"use client";

import { useState, FormEvent, useRef } from "react";
import { useMapboxGeocoder } from "@/hooks/use-mapbox-geocoder";
import { Field, FieldLabel } from "../ui/field";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { DialogCloseButton } from "../shared";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  Loader2,
  TrendingUp,
  MapPin,
  Building2,
  BarChart3,
  Home,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValuewebEstimateResult } from "@/lib/brain-types";

// §4.3 — tipo_inmueble
const TIPO_INMUEBLE_OPTIONS = [
  { value: "", label: "Seleccionar tipo" },
  { value: "2", label: "Casa Habitación" },
  { value: "3", label: "Casa en Condominio" },
  { value: "4", label: "Departamento en Condominio" },
];

// §4.3 — clase_inmueble
const CLASE_INMUEBLE_OPTIONS = [
  { value: "", label: "Seleccionar clase" },
  { value: "2", label: "Económica" },
  { value: "3", label: "Interés Social" },
  { value: "4", label: "Media" },
  { value: "5", label: "Semilujo" },
  { value: "6", label: "Residencial" },
  { value: "7", label: "Residencial Plus" },
  { value: "8", label: "Única" },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
      {children}
    </p>
  );
}

function NumInput({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <input
        name={name}
        type="number"
        min="0"
        placeholder={placeholder ?? "—"}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  );
}

export function FormValueEstimator() {
  const geocoder = useMapboxGeocoder({ country: "MX", language: "es" });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValuewebEstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!geocoder.hasCoordinates) {
      toast.error("Selecciona una dirección del listado de sugerencias");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const getNum = (key: string) => {
      const v = Number(fd.get(key));
      return v > 0 ? v : undefined;
    };
    const getStr = (key: string) => (fd.get(key) as string) || undefined;

    const constructionYear = getNum("anio_construccion");
    const antiguedad = constructionYear
      ? new Date().getFullYear() - constructionYear
      : undefined;

    const body = {
      lat: geocoder.coordinates!.lat,
      lon: geocoder.coordinates!.lon,
      direccion: geocoder.selected!.place_name,
      radius: getNum("radius"),
      tipo_inmueble: getStr("tipo_inmueble")
        ? Number(getStr("tipo_inmueble"))
        : undefined,
      clase_inmueble: getStr("clase_inmueble")
        ? Number(getStr("clase_inmueble"))
        : undefined,
      vivienda_nueva_usada: getStr("vivienda_nueva_usada") as
        | "Nueva"
        | "Usada"
        | undefined,
      habitaciones: getNum("habitaciones"),
      banos: getNum("banos"),
      estacionamientos: getNum("estacionamientos"),
      num_pisos: getNum("num_pisos"),
      superficie_construida: getNum("superficie_construida"),
      tamano_terreno: getNum("tamano_terreno"),
      antiguedad_anos: antiguedad,
    };

    try {
      const res = await fetch("/api/valueweb/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      setResult(data);
      toast.success("Estimación completada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-5">

        {/* ── UBICACIÓN ─────────────────────────────── */}
        <div>
          <SectionHeader>
            Ubicación <span className="text-destructive">*</span>
          </SectionHeader>
          <div className="grid md:grid-cols-3 gap-3">

            {/* Address search with Mapbox */}
            <div className="md:col-span-2 flex flex-col gap-1 relative">
              <label className="text-xs font-medium text-foreground/80">
                Dirección
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                {geocoder.hasCoordinates && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
                )}
                {geocoder.isLoading && !geocoder.hasCoordinates && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin pointer-events-none" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={geocoder.query}
                  placeholder="Av. Presidente Masaryk 111, Polanco, CDMX"
                  autoComplete="off"
                  onChange={(e) => {
                    geocoder.search(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={cn(
                    "h-9 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50",
                    geocoder.hasCoordinates && "border-emerald-400 ring-1 ring-emerald-400/30"
                  )}
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && geocoder.suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                  {geocoder.suggestions.map((feat) => (
                    <button
                      key={feat.id}
                      type="button"
                      onMouseDown={() => {
                        geocoder.selectFeature(feat);
                        setShowSuggestions(false);
                      }}
                      className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{feat.place_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Coordinates badge */}
              {geocoder.hasCoordinates && geocoder.coordinates && (
                <p className="text-[10px] text-emerald-600 font-mono">
                  ✓ {geocoder.coordinates.lat.toFixed(5)}, {geocoder.coordinates.lon.toFixed(5)}
                </p>
              )}
            </div>

            <NumInput label="Radio (m)" name="radius" placeholder="200" />
          </div>
        </div>

        {/* ── TIPO DE INMUEBLE ───────────────────────── */}
        <div>
          <SectionHeader>Tipo de inmueble</SectionHeader>
          <div className="grid md:grid-cols-3 gap-3">
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <NativeSelect name="tipo_inmueble" defaultValue="">
                {TIPO_INMUEBLE_OPTIONS.map((o) => (
                  <NativeSelectOption key={o.value} value={o.value}>
                    {o.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Clase / Nivel</FieldLabel>
              <NativeSelect name="clase_inmueble" defaultValue="">
                {CLASE_INMUEBLE_OPTIONS.map((o) => (
                  <NativeSelectOption key={o.value} value={o.value}>
                    {o.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <NativeSelect name="vivienda_nueva_usada" defaultValue="">
                <NativeSelectOption value="">Seleccionar</NativeSelectOption>
                <NativeSelectOption value="Nueva">Nueva</NativeSelectOption>
                <NativeSelectOption value="Usada">Usada</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
        </div>

        {/* ── CARACTERÍSTICAS ───────────────────────── */}
        <div>
          <SectionHeader>Características</SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NumInput label="Habitaciones" name="habitaciones" placeholder="3" />
            <NumInput label="Baños" name="banos" placeholder="2" />
            <NumInput label="Estacionamientos" name="estacionamientos" placeholder="1" />
            <NumInput label="Núm. pisos" name="num_pisos" placeholder="2" />
          </div>
        </div>

        {/* ── SUPERFICIES ───────────────────────────── */}
        <div>
          <SectionHeader>Superficies y antigüedad</SectionHeader>
          <div className="grid md:grid-cols-3 gap-3">
            <NumInput label="Sup. construida (m²)" name="superficie_construida" placeholder="120" />
            <NumInput label="Tamaño terreno (m²)" name="tamano_terreno" placeholder="200" />
            <NumInput label="Año de construcción" name="anio_construccion" placeholder="2010" />
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────── */}
        <DialogFooter className="pt-1">
          <DialogCloseButton />
          <Button type="submit" disabled={isLoading || !geocoder.hasCoordinates} className="min-w-32">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Estimando...</>
            ) : (
              "Calcular valor"
            )}
          </Button>
        </DialogFooter>
      </form>

      {/* ── ERROR ─────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── RESULTS ───────────────────────────────── */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Valor estimado */}
          <div
            className={cn(
              "p-5 rounded-2xl border",
              result.valor_promedio
                ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-800/30"
                : "bg-muted/40 border-border"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-sm">Valor estimado de mercado</h3>
            </div>
            {result.valor_promedio ? (
              <div className="space-y-1">
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  ${result.valor_promedio.toLocaleString("es-MX")}
                  <span className="text-sm font-normal text-muted-foreground ml-2">MXN</span>
                </p>
                {result.valor_promedio_m2 && (
                  <p className="text-sm text-muted-foreground">
                    ${result.valor_promedio_m2.toLocaleString("es-MX")} por m²
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {result.message || "Sin comparables suficientes en el radio especificado"}
              </p>
            )}
          </div>

          {/* Comparables */}
          {result.inmuebles && result.inmuebles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">
                  Comparables ({result.inmuebles.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                {result.inmuebles.slice(0, 6).map((c, i) => (
                  <div
                    key={c.clave_avaluo || i}
                    className="flex items-start justify-between p-3 bg-muted/40 rounded-xl text-sm gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <Home className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.colonia || c.clase_inmueble}</p>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />{c.distancia_metros.toFixed(0)} m
                          </span>
                          <span>·</span>
                          <span>{c.superficie_construida} m²</span>
                          {c.recamaras > 0 && <><span>·</span><span>{c.recamaras} rec</span></>}
                          {c.banos > 0 && <><span>·</span><span>{c.banos} baños</span></>}
                          {c.estacionamiento > 0 && <><span>·</span><span>{c.estacionamiento} est</span></>}
                          <span>·</span>
                          <span>{c.vivienda_nueva_o_usada}</span>
                          <span>·</span>
                          <span className="opacity-60">{c.fecha_avaluo?.slice(0, 7)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">${c.valor_final.toLocaleString("es-MX")}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ${c.valor_m2.toLocaleString("es-MX")}/m²
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {result.data?.estadisticas && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {result.data.estadisticas.total_avaluos_encontrados !== undefined && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total avalúos</p>
                    <p className="font-semibold">{result.data.estadisticas.total_avaluos_encontrados}</p>
                  </div>
                </div>
              )}
              {result.data.estadisticas.avaluos_nueva_vs_usada && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
                  <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Nueva / Usada</p>
                    <p className="font-semibold text-[11px]">
                      {Object.entries(result.data.estadisticas.avaluos_nueva_vs_usada)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

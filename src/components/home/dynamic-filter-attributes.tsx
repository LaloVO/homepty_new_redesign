"use client";
/**
 * DynamicFilterAttributes
 * Renderiza los filtros especializados adaptativos basados en los atributos
 * del subsegmento taxonómico seleccionado.
 *
 * Tipos de atributos soportados:
 * - integer / decimal → Input numérico (min/max)
 * - boolean → Checkbox
 * - enum → NativeSelect
 * - text → Input de texto
 *
 * Este componente es el corazón del sistema de filtros adaptativos.
 * Reemplaza la función `renderDynamicFilters` de HomeptyWebApp (legado),
 * pero de forma genérica y basada en datos del Brain API.
 */
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TaxAttribute } from "@/lib/brain-client";

interface DynamicFilterAttributesProps {
  attributes: TaxAttribute[];
  // Modo: "url" actualiza los search params, "controlled" usa callbacks
  mode?: "url" | "controlled";
  values?: Record<string, string>;
  onChange?: (key: string, value: string) => void;
}

export function DynamicFilterAttributes({
  attributes,
  mode = "url",
  values = {},
  onChange,
}: DynamicFilterAttributesProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  if (attributes.length === 0) return null;

  const getValue = (clave: string): string => {
    if (mode === "url") {
      return searchParams.get(`attr_${clave}`) ?? "";
    }
    return values[clave] ?? "";
  };

  const handleChange = (clave: string, value: string) => {
    if (mode === "url") {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(`attr_${clave}`, value);
      } else {
        params.delete(`attr_${clave}`);
      }
      replace(`${pathname}?${params.toString()}`);
    } else {
      onChange?.(clave, value);
    }
  };

  // Separar atributos globales y especializados para renderizado
  const globalAttrs = attributes.filter(a => a.esGlobal);
  const specializedAttrs = attributes.filter(a => !a.esGlobal);

  const renderAttribute = (attr: TaxAttribute) => {
    const currentValue = getValue(attr.clave);

    switch (attr.tipoDato) {
      case "integer":
      case "decimal":
        return (
          <Field key={attr.id} className="flex-1 min-w-[120px]">
            <FieldLabel htmlFor={`attr_${attr.clave}`}>
              {attr.nombre}
              {attr.unidad ? ` (${attr.unidad})` : ""}
            </FieldLabel>
            <Input
              type="number"
              id={`attr_${attr.clave}`}
              name={`attr_${attr.clave}`}
              placeholder={attr.tipoDato === "integer" ? "Ej: 2" : "Ej: 2.5"}
              value={currentValue}
              onChange={(e) => handleChange(attr.clave, e.target.value)}
              step={attr.tipoDato === "decimal" ? "0.5" : "1"}
              min="0"
            />
          </Field>
        );

      case "boolean":
        return (
          <div key={attr.id} className="flex items-center gap-2 min-w-[120px]">
            <Checkbox
              id={`attr_${attr.clave}`}
              checked={currentValue === "true"}
              onCheckedChange={(checked) =>
                handleChange(attr.clave, checked ? "true" : "")
              }
            />
            <Label htmlFor={`attr_${attr.clave}`} className="text-sm font-normal cursor-pointer">
              {attr.nombre}
            </Label>
          </div>
        );

      case "enum":
        return (
          <Field key={attr.id} className="flex-1 min-w-[140px]">
            <FieldLabel htmlFor={`attr_${attr.clave}`}>{attr.nombre}</FieldLabel>
            <NativeSelect
              id={`attr_${attr.clave}`}
              value={currentValue}
              onChange={(e) => handleChange(attr.clave, e.target.value)}
            >
              <NativeSelectOption value="">Cualquiera</NativeSelectOption>
              {(attr.opcionesEnum ?? []).map((opt) => (
                <NativeSelectOption key={opt} value={opt}>
                  {opt}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        );

      case "text":
        return (
          <Field key={attr.id} className="flex-1 min-w-[140px]">
            <FieldLabel htmlFor={`attr_${attr.clave}`}>{attr.nombre}</FieldLabel>
            <Input
              type="text"
              id={`attr_${attr.clave}`}
              name={`attr_${attr.clave}`}
              placeholder={`Filtrar por ${attr.nombre.toLowerCase()}`}
              value={currentValue}
              onChange={(e) => handleChange(attr.clave, e.target.value)}
            />
          </Field>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Atributos globales (precio, área, etc.) */}
      {globalAttrs.length > 0 && (
        <div className="flex flex-wrap items-end gap-4">
          {globalAttrs.map(renderAttribute)}
        </div>
      )}

      {/* Separador si hay ambos tipos */}
      {globalAttrs.length > 0 && specializedAttrs.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Características específicas
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      )}

      {/* Atributos especializados por tipo de activo */}
      {specializedAttrs.length > 0 && (
        <div className="flex flex-wrap items-end gap-4">
          {specializedAttrs.map(renderAttribute)}
        </div>
      )}
    </div>
  );
}

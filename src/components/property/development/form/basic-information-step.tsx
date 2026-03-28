"use client";
import { ChangeEvent, RefObject } from "react";
import { ErrorMessage } from "@/components/shared";
import { InputForm } from "@/components/shared/input-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { type BasicInfoDevelopment } from "@/schemas";
import { TYPES_OF_DEVELOPMENTS, TYPES_OF_OPERATIONS, TYPES_OF_USES } from "@/utils/constants";
import { UploadIcon } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

interface Props {
  handleClick: () => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  developmentImageUrls: string[];
}

export function BasicInformationStep({
  handleClick,
  handleChange,
  inputRef,
  developmentImageUrls,
}: Props) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<BasicInfoDevelopment>();

  // Mostrar descripción del tipo de desarrollo seleccionado
  const selectedTipo = watch("tipo");
  const selectedTipoDesc = TYPES_OF_DEVELOPMENTS.find(
    (d) => d.value === selectedTipo
  )?.descripcion;

  return (
    <section className="grid grid-cols-2 items-start gap-6">

      {/* Categoría de desarrollo */}
      <div className="flex flex-col gap-y-2 col-span-2">
        <Label htmlFor="tipo">Categoría de desarrollo *</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Define el modelo del proyecto. El tipo de inmueble se clasifica en el siguiente paso.
        </p>
        <div className="flex flex-col gap-y-1">
          <NativeSelect
            id="tipo"
            {...register("tipo")}
            aria-invalid={errors.tipo ? "true" : "false"}
          >
            <NativeSelectOption value="" disabled>
              Seleccionar categoría de desarrollo
            </NativeSelectOption>
            {TYPES_OF_DEVELOPMENTS.map((dev_type) => (
              <NativeSelectOption key={dev_type.id} value={dev_type.value}>
                {dev_type.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {errors.tipo && <ErrorMessage message={errors.tipo.message!} />}
          {/* Descripción contextual del tipo seleccionado */}
          {selectedTipoDesc && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2 mt-1">
              {selectedTipoDesc}
            </p>
          )}
        </div>
      </div>

      <InputForm
        label="Nombre del desarrollo *"
        type="text"
        {...register("nombre")}
        placeholder="Ej: Residencial Los Pinos, Torre Reforma 180"
        error={errors.nombre?.message}
      />

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="id_tipo_operacion">Tipo de operación *</Label>
        <NativeSelect
          id="id_tipo_operacion"
          {...register("id_tipo_accion", { valueAsNumber: true })}
        >
          {TYPES_OF_OPERATIONS.map((type) => (
            <NativeSelectOption key={type.id} value={type.id}>
              {type.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="id_tipo_uso">
          Tipo de uso *
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Determina qué tipos de inmueble se mostrarán en el siguiente paso.
        </p>
        <NativeSelect
          id="id_tipo_uso"
          {...register("id_tipo_uso", { valueAsNumber: true })}
        >
          {TYPES_OF_USES.map((type) => (
            <NativeSelectOption key={type.id} value={type.id}>
              {type.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-y-4 col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="imagenes">Imágenes generales *</Label>
          <Button type="button" variant="outline" onClick={handleClick}>
            <UploadIcon />
            Agregar fotos
          </Button>
          <Input
            type="file"
            ref={inputRef}
            onChange={handleChange}
            className="hidden"
            multiple
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="w-full flex items-center justify-start col-span-4">
            {developmentImageUrls.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No hay imágenes subidas
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {developmentImageUrls[index] ? (
                  <Image
                    src={developmentImageUrls[index]}
                    width={140}
                    height={140}
                    alt={`img-${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <UploadIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 col-span-2">
        <Label htmlFor="descripcion_desarrollo">Describe este desarrollo *</Label>
        <div className="flex flex-col gap-y-1">
          <Textarea
            className="min-h-20 max-h-40"
            placeholder="Ej: Desarrollo residencial vertical con 120 departamentos, amenidades de primer nivel y ubicación estratégica..."
            {...register("descripcion")}
            aria-invalid={errors.descripcion ? "true" : "false"}
          />
          {errors.descripcion && (
            <ErrorMessage message={errors.descripcion.message!} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-y-2 col-span-2">
        <Label htmlFor="descripcion_estado">
          Estado del desarrollo *
        </Label>
        <div className="flex flex-col gap-y-1">
          <Textarea
            className="min-h-20 max-h-40"
            placeholder="Ej: Proyecto en preventa con avance de obra del 40%, entrega estimada Q4 2026..."
            {...register("descripcion_estado")}
            aria-invalid={errors.descripcion_estado ? "true" : "false"}
          />
          {errors.descripcion_estado && (
            <ErrorMessage message={errors.descripcion_estado.message!} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-y-2 col-span-2">
        <Label htmlFor="descripcion_inversion_desarrollo">
          Tesis de inversión
        </Label>
        <div className="flex flex-col gap-y-1">
          <Textarea
            className="min-h-20 max-h-40"
            placeholder="Ej: Retorno estimado del 18% anual, zona de alta plusvalía, demanda comprobada..."
            {...register("descripcion_inversion")}
            aria-invalid={errors.descripcion_inversion ? "true" : "false"}
          />
          {errors.descripcion_inversion && (
            <ErrorMessage message={errors.descripcion_inversion.message!} />
          )}
        </div>
      </div>
    </section>
  );
}

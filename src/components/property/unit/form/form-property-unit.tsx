"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { defineStepper } from "@/components/ui/stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { BasicInfoPropertySchema, LocationCharacteristicsPropertySchema  } from "@/schemas";
import { BasicInformationStep } from "./basic-information-step";
import { createUnitAction } from "@/server/actions";
import { Confirm } from "./confirm";
import { toast } from "sonner";
import { LocationCharacteristicsStep } from "./location-characteristics-step";
import { TaxonomyStep } from "./taxonomy-step";
import { ButtonBack } from "@/components/shared";
import { Card } from "@/components/ui/card";

// Schema para el paso de taxonomía (campos opcionales, sin validación estricta)
const TaxonomyStepSchema = z.object({
  taxonomy_vertical_id: z.number().int().positive().nullable().optional(),
  taxonomy_segment_id: z.number().int().positive().nullable().optional(),
  taxonomy_subsegment_id: z.number().int().positive().nullable().optional(),
  taxonomy_attributes: z.record(z.string(), z.string()).optional(),
});

const { useStepper, steps, utils } = defineStepper(
  {
    id: "basic-info",
    label: "Información básica",
    schema: BasicInfoPropertySchema,
  },
  {
    id: "taxonomy",
    label: "Clasificación",
    schema: TaxonomyStepSchema,
  },
  {
    id: "location-characteristics",
    label: "Ubicación y características",
    schema: LocationCharacteristicsPropertySchema,
  },
  { id: "confirm", label: "Confirmar", schema: z.object({}) }
);

export function FormPropertyUnit() {
  const [unitsImageUrls, setUnitsImageUrls] = useState<string[]>([]);
  const [unitsFileUrls, setUnitsFileUrls] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleClick = () => {
    inputRef.current?.click(); // dispara el input file oculto
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUnitsFileUrls([...unitsFileUrls, ...files]);
      const newImagesUrls = files.map((file) => URL.createObjectURL(file));

      setUnitsImageUrls([...unitsImageUrls, ...newImagesUrls]);
    }
  };
  const stepper = useStepper();

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      tipo: "Departamento",
      nombre: "",
      id_tipo_accion: 1,
      id_tipo_uso: 1,
      descripcion: "",
      descripcion_estado: "",
      descripcion_inversion: undefined,
      id_estado: undefined,
      id_ciudad: undefined,
      codigo_postal: undefined,
      direccion: "",
      colonia: undefined,
      area: undefined,
      precio: undefined,
      habitaciones: undefined,
      banios: undefined,
      estacionamientos: undefined,
      caracteristicas: undefined,
      // Taxonomía Inmobiliaria
      taxonomy_vertical_id: null,
      taxonomy_segment_id: null,
      taxonomy_subsegment_id: null,
      taxonomy_attributes: {},
    },
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const onSubmit = handleSubmit(
    async (values: z.infer<typeof stepper.current.schema>) => {
      console.log(`Form values for step ${stepper.current.id}:`, values);
      if (stepper.isLast) {
        // Obtener TODOS los valores del formulario, no solo del paso actual
        const allFormValues = getValues();
        console.log("All form values:", allFormValues);

        /** Enviar al back */
        const response = await createUnitAction({
          unit: allFormValues,
          unitFiles: unitsFileUrls,
        });
        if (!response.ok) {
          toast.error(response.message);
          return;
        }
        toast.success("Unidad creada con éxito!");
        setUnitsImageUrls([]);
        setUnitsFileUrls([]);
        /** Hacer todo aca */
        stepper.reset();
        reset();
      } else {
        stepper.next();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  );

  useEffect(() => {
    console.log({ errors });
  }, [errors]);
  const currentIndex = utils.getIndex(stepper.current.id);
  return (
    <Card>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-y-6 px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Paso {currentIndex + 1}: {stepper.current.label}
            </h2>
            <ButtonBack />
          </div>
          <nav aria-label="Checkout Steps" className="group my-4">
            <ol
              className="flex items-center justify-between gap-2"
              role="tablist"
            >
              {stepper.all.map((step, index, array) => (
                <Fragment key={step.id}>
                  <li className="flex items-center gap-4 shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      variant={index <= currentIndex ? "default" : "secondary"}
                      aria-current={
                        stepper.current.id === step.id ? "step" : undefined
                      }
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className="flex size-10 items-center justify-center rounded-full"
                      onClick={async () => {
                        const valid = await trigger();
                        //must be validated
                        if (!valid) return;
                        //can't skip steps forwards but can go back anywhere if validated
                        if (index - currentIndex > 1) return;
                        stepper.goTo(step.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {index + 1}
                    </Button>
                    <span className="text-sm font-medium">{step.label}</span>
                  </li>
                  {index < array.length - 1 && (
                    <Separator
                      className={`flex-1 ${
                        index < currentIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </ol>
          </nav>
          <div className="flex flex-col gap-y-4">
            {stepper.switch({
              "basic-info": () => (
                <BasicInformationStep
                  handleClick={handleClick}
                  handleChange={handleChange}
                  inputRef={inputRef}
                  unitsImageUrls={unitsImageUrls}
                />
              ),
              "taxonomy": () => <TaxonomyStep />,
              "location-characteristics": () => <LocationCharacteristicsStep />,
              confirm: () => <Confirm />,
            })}
            {!stepper.isLast ? (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={stepper.prev}
                  disabled={stepper.isFirst}
                >
                  Paso anterior
                </Button>
                <Button type="submit">
                  {stepper.isLast ? "Regresar" : "Paso siguiente"}
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                className="w-full max-w-60 mx-auto"
                disabled={isSubmitting}
              >
                Confirmar
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </Card>
  );
}

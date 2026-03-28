import {
  DialogCloseButton,
  ErrorMessage,
  InputForm,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClientSchema } from "@/schemas";
import { createClientAction, updateClientAction } from "@/server/actions";
import { Client } from "@/types";
import { TYPES_OF_UNITS } from "@/utils/constants";
import { UNIT_TIPO_VALUES } from "@/schemas/property-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
interface Props {
  client: Client | null;
  handleDialog: () => void;
}
export function FormClient({ client, handleDialog }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ClientSchema),
    mode: "onSubmit",
    defaultValues: {
      nombre_cliente: client?.nombre_cliente ?? "",
      email_cliente: client?.email_cliente ?? "",
      telefono_cliente: client?.telefono_cliente ?? "",
      dni_cif_cliente: client?.dni_cif_cliente ?? "",
      presupuesto_desde_cliente: client?.presupuesto_desde_cliente ?? 0,
      presupuesto_hasta_cliente: client?.presupuesto_hasta_cliente ?? 0,
      nota_cliente: client?.nota_cliente ?? "",
      cantidad_banios: client?.cantidad_banios ?? 0,
      cantidad_habitaciones: client?.cantidad_habitaciones ?? 0,
      cantidad_estacionamientos: client?.cantidad_estacionamientos ?? 0,
      tipo_propiedad: (client?.tipo_propiedad as typeof UNIT_TIPO_VALUES[number] | undefined) ?? "Departamento",
      accion: client?.accion ?? null,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (client) {
        const response = await updateClientAction({
          clientId: client.id_cliente,
          client: data,
        });
        if (!response.ok) {
          console.log("Error:", response.message);
          toast.error(
            response.message ||
              "Error al editar el cliente. Por favor, intenta de nuevo."
          );
          return;
        }
      } else {
        const response = await createClientAction({ client: data });
        if (!response.ok) {
          console.log("Error:", response.message);
          toast.error(
            response.message ||
              "Error al crear el cliente. Por favor, intenta de nuevo."
          );
          return;
        }
      }
      toast.success(
        client
          ? "Cliente actualizado exitosamente."
          : "Cliente creado exitosamente."
      );
      handleDialog();
    } catch (error) {
      console.error("Error creating client:", error);
    }
  });
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-6 text-sm">
      <InputForm
        label="Nombre del cliente *"
        placeholder="Ingrese nombre"
        type="text"
        {...register("nombre_cliente")}
        error={errors.nombre_cliente?.message}
      />
      <InputForm
        label="Email del cliente *"
        placeholder="Ingrese email"
        type="email"
        {...register("email_cliente")}
        error={errors.email_cliente?.message}
      />
      <InputForm
        label="Teléfono del cliente *"
        placeholder="Ingrese teléfono"
        type="text"
        {...register("telefono_cliente")}
        error={errors.telefono_cliente?.message}
      />
      <InputForm
        label="DNI/CIF"
        placeholder="DNI O CIF"
        type="text"
        {...register("dni_cif_cliente")}
        error={errors.dni_cif_cliente?.message}
      />
      <InputForm
        label="Presupuesto desde"
        placeholder="Presupuesto minimo"
        type="number"
        {...register("presupuesto_desde_cliente", { valueAsNumber: true })}
        error={errors.presupuesto_desde_cliente?.message}
      />
      <InputForm
        label="Presupuesto hasta"
        placeholder="Presupuesto máximo"
        type="number"
        {...register("presupuesto_hasta_cliente", { valueAsNumber: true })}
        error={errors.presupuesto_hasta_cliente?.message}
      />
      <Separator className="w-full col-span-2" />
      <h4 className="text-lg font-semibold">Caracteristicas generales</h4>
      <div className="col-span-2 grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="id_tipo_propiedad">Tipo de propiedad *</Label>
          <div className="flex flex-col gap-y-1">
            <NativeSelect
              id="id_tipo_propiedad"
              {...register("tipo_propiedad")}
              aria-invalid={!!errors.tipo_propiedad}
            >
              <NativeSelectOption value="">
                Seleccionar tipo...
              </NativeSelectOption>
              {TYPES_OF_UNITS.map((property) => (
                <NativeSelectOption key={property.id} value={property.label}>
                  {property.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {errors.tipo_propiedad && (
              <ErrorMessage message={errors.tipo_propiedad.message!} />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="accion">Tipo de acción *</Label>
          <div className="flex flex-col gap-y-1">
            <NativeSelect id="accion" {...register("accion")}>
              <NativeSelectOption value="">
                Seleccionar tipo de acción
              </NativeSelectOption>
              <NativeSelectOption value="Comprar">Comprar</NativeSelectOption>
              <NativeSelectOption value="Rentar">Rentar</NativeSelectOption>
            </NativeSelect>
            {errors.accion && <ErrorMessage message={errors.accion.message!} />}
          </div>
        </div>
      </div>
      <div className="col-span-2 grid grid-cols-3 gap-6 items-start">
        <InputForm
          label="Baños"
          placeholder="Cant baños"
          type="number"
          {...register("cantidad_banios", { valueAsNumber: true })}
          error={errors.cantidad_banios?.message}
        />
        <InputForm
          label="Habitaciones"
          placeholder="Cant habitaciones"
          type="number"
          {...register("cantidad_habitaciones", { valueAsNumber: true })}
          error={errors.cantidad_habitaciones?.message}
        />
        <InputForm
          label="Estacionamientos"
          placeholder="Cant estacionamientos"
          type="number"
          {...register("cantidad_estacionamientos", { valueAsNumber: true })}
          error={errors.cantidad_estacionamientos?.message}
        />
      </div>

      <Field className="col-span-2">
        <FieldLabel htmlFor="nota">Nota</FieldLabel>
        <Textarea
          className="min-h-20 max-h-40"
          placeholder="Notas adicionales sobre el cliente"
          {...register("nota_cliente")}
        />
      </Field>
      <DialogFooter className="col-span-2">
        <DialogCloseButton />
        <Button
          type="submit"
          title={client ? "Guardar cambios" : "Crear cliente"}
          className="min-w-28"
          disabled={isSubmitting}
        >
          {client ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
}

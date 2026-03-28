"use client";
import { USER_ACTIVITY } from "@/utils/constants";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { Input } from "../ui/input";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { Textarea } from "../ui/textarea";
import { DialogFooter } from "../ui/dialog";
import { DialogCloseButton } from "../shared";
import { Button } from "../ui/button";
import { useActionState, useEffect, useRef, useState } from "react";
import { updateUserAction, fetchStatesAction, fetchCitiesAction } from "@/server/actions";
import { UserWithLocation } from "@/server/queries/user/get-user-info";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2 } from "lucide-react";

interface Props {
  user: UserWithLocation;
  closeDialog: () => void;
}
export function FormUser({ user, closeDialog }: Props) {
  const [state, formAction, pending] = useActionState(
    updateUserAction.bind(undefined, user.id),
    undefined
  );
  const [photoUrl, setPhotoUrl] = useState<string>(user.imagen_perfil_usuario ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for locations
  const [statesList, setStatesList] = useState<{ id_estado: number, nombre_estado: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id_ciudad: number, nombre_ciudad: string }[]>([]);
  const [selectedState, setSelectedState] = useState<number | "">(user.id_estado ?? "");
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load initial states
  useEffect(() => {
    async function loadInitialData() {
      setLoadingLocations(true);
      try {
        const states = await fetchStatesAction();
        setStatesList(states);

        if (user.id_estado) {
          const cities = await fetchCitiesAction(user.id_estado);
          setCitiesList(cities);
        }
      } catch (error) {
        console.error("Error loading initial locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    }
    loadInitialData();
  }, [user.id_estado]);

  // Handle state change
  const onStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value ? Number(e.target.value) : "";
    setSelectedState(newStateId as number | "");

    // Clear current cities and reset selector to maintain coherence
    setCitiesList([]);
    const citySelect = document.getElementById("id_ciudad") as HTMLSelectElement;
    if (citySelect) citySelect.value = "";

    if (newStateId) {
      setLoadingLocations(true);
      try {
        const cities = await fetchCitiesAction(newStateId as number);
        setCitiesList(cities);
      } catch (error) {
        console.error("Error fetching cities for state:", newStateId, error);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede exceder 5MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${user.id}/profile.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(path);

      setPhotoUrl(urlData.publicUrl);
      toast.success("Foto subida correctamente");
    } catch (err) {
      console.error("[FormUser] Photo upload error:", err);
      toast.error("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (state === undefined) return;
    if (state && !state?.ok) {
      toast.error(state?.message || "Error al actualizar el perfil.");
    } else {
      toast.success(state.message);
      closeDialog();
    }
  }, [state, closeDialog]);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Hidden field for photo URL */}
      <input type="hidden" name="imagen_perfil_usuario" value={photoUrl} />

      <FieldGroup>
        {/* Photo Upload Section */}
        <div className="flex items-center gap-4 pb-2">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {photoUrl ? (
                <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Foto de perfil</p>
            <p className="text-[10px] text-gray-400">JPG, PNG. Máx 5MB</p>
          </div>
        </div>

        <FieldSeparator />

        <Field>
          <FieldLabel htmlFor="nombre_usuario">Nombre de usuario</FieldLabel>
          <Input
            type="text"
            id="nombre_usuario"
            name="nombre_usuario"
            defaultValue={
              state?.inputs?.nombre_usuario.toString() ??
              user.nombre_usuario ??
              ""
            }
            aria-invalid={!!state?.errors?.nombre_usuario}
          />
          {state?.errors?.nombre_usuario && (
            <FieldError>{state.errors.nombre_usuario}</FieldError>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="telefono_usuario">Teléfono</FieldLabel>
            <Input
              type="tel"
              id="telefono_usuario"
              name="telefono_usuario"
              defaultValue={
                state?.inputs?.telefono_usuario.toString() ??
                user.telefono_usuario ??
                ""
              }
              aria-invalid={!!state?.errors?.telefono_usuario}
            />
            {state?.errors?.telefono_usuario && (
              <FieldError>{state.errors.telefono_usuario}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="email_usuario">Correo electrónico</FieldLabel>
            <Input
              type="email"
              id="email_usuario"
              name="email_usuario"
              defaultValue={
                state?.inputs?.email_usuario.toString() ?? user.email_usuario
              }
              aria-invalid={!!state?.errors?.email_usuario}
              readOnly
            />
            {state?.errors?.email_usuario && (
              <FieldError>{state.errors.email_usuario}</FieldError>
            )}
          </Field>
        </div>
        <FieldSeparator />
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="actividad_usuario">
              Actividad profesional
            </FieldLabel>
            <NativeSelect
              id="actividad_usuario"
              name="actividad_usuario"
              defaultValue={
                state?.inputs?.actividad_usuario.toString() ??
                user.actividad_usuario ??
                ""
              }
              aria-invalid={!!state?.errors?.actividad_usuario}
            >
              {USER_ACTIVITY.map((activity) => (
                <NativeSelectOption key={activity.id} value={activity.value}>
                  {activity.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {state?.errors?.actividad_usuario && (
              <FieldError>{state.errors.actividad_usuario}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="id_estado">Estado</FieldLabel>
            <NativeSelect
              id="id_estado"
              name="id_estado"
              value={selectedState}
              onChange={onStateChange}
              aria-invalid={!!state?.errors?.id_estado}
            >
              <option value="">Selecciona un estado</option>
              {statesList.map((st) => (
                <NativeSelectOption key={st.id_estado} value={st.id_estado}>
                  {st.nombre_estado}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {state?.errors?.id_estado && (
              <FieldError>{state.errors.id_estado}</FieldError>
            )}
          </Field>
        </div>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="id_ciudad">Ciudad / Municipio</FieldLabel>
            {loadingLocations && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
          <NativeSelect
            id="id_ciudad"
            name="id_ciudad"
            defaultValue={
              state?.inputs?.id_ciudad.toString() ?? user.id_ciudad ?? ""
            }
            aria-invalid={!!state?.errors?.id_ciudad}
            disabled={!selectedState || citiesList.length === 0 || loadingLocations}
          >
            <option value="">
              {!selectedState
                ? "Selecciona un estado primero"
                : loadingLocations
                  ? "Cargando municipios..."
                  : "Selecciona una ciudad"}
            </option>
            {citiesList.map((city) => (
              <NativeSelectOption key={city.id_ciudad} value={city.id_ciudad}>
                {city.nombre_ciudad}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {state?.errors?.id_ciudad && (
            <FieldError>{state.errors.id_ciudad}</FieldError>
          )}
        </Field>


        <Field>
          <FieldLabel htmlFor="descripcion_usuario">Descripción</FieldLabel>
          <Textarea
            id="descripcion_usuario"
            name="descripcion_usuario"
            rows={4}
            placeholder="Cuentanos sobre ti..."
            defaultValue={
              state?.inputs?.descripcion_usuario.toString() ??
              user.descripcion_usuario ??
              ""
            }
            aria-invalid={!!state?.errors?.descripcion_usuario}
          />
          {state?.errors?.descripcion_usuario && (
            <FieldError>{state.errors.descripcion_usuario}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogCloseButton />
        <Button
          type="submit"
          title="Guardar"
          className="min-w-28"
          disabled={pending}
        >
          Guardar
        </Button>
      </DialogFooter>
    </form >
  );
}

import { Database } from "./database";

export * from "./database";

export type ActionResponse = {
  ok: boolean;
  message: string;
};

export type FormState<T> =
  | {
    ok?: boolean;
    errors?: Partial<Record<keyof T, string[]>>;
    inputs?: Partial<T>;
    message?: string;
  }
  | undefined;

export type QueryResponse<T> = {
  ok: boolean;
  message: string;
  data?: T;
};
export type DevelopmentType =
  | "Preventa"
  | "Edificio"
  | "Plaza Comercial"
  | "Lote";
export type UnitType = "Departamento" | "Local comercial" | "Oficina" | "Casa";

export type SidebarItem = {
  id: number;
  title: string;
  url: string;
  icon: string;
};
export type PropertyType = Database["public"]["Enums"]["tipo_propiedad"];
export type Request = Database["public"]["Tables"]["solicitudes"]["Row"];
export type RequestStatus = Request["estado_solicitud"];
export type User = Database["public"]["Tables"]["usuarios"]["Row"];
export type Property = Database["public"]["Tables"]["propiedades"]["Row"];
type PropertyImage =
  Database["public"]["Tables"]["imagenes_propiedades"]["Row"];
type PropertyAmenty = Database["public"]["Tables"]["amenidades_propiedades"]["Row"];
export type PropertyWithImages = Property & {
  imagenes_propiedades: PropertyImage[];
  accionespropiedades?: { nombre_accion_propiedad: string } | null;
};
export type PropertyWithImagesAndAmenities = PropertyWithImages & {
  amenidades_propiedades: PropertyAmenty[];
};
export type PropertyWithLocation = Property & {
  coordinates?: [number, number]; // [longitude, latitude]
};

export type Offer = Database["public"]["Tables"]["ofertas"]["Row"];
export type Client = Database["public"]["Tables"]["clientes"]["Row"];

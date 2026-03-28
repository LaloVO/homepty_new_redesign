import { createClient } from "@/lib/supabase/server";

export async function getStates() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("estados")
        .select("id_estado, nombre_estado")
        .eq("id_pais", 1) // México
        .order("nombre_estado", { ascending: true });

    if (error) {
        console.error("[getStates] Error:", error);
        return [];
    }
    return data;
}

export async function getCitiesByState(stateId: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("ciudades")
        .select("id_ciudad, nombre_ciudad")
        .eq("id_estado", stateId)
        .order("nombre_ciudad", { ascending: true });

    if (error) {
        console.error("[getCitiesByState] Error:", error);
        return [];
    }
    return data;
}

"use server";
import { getStates, getCitiesByState } from "@/server/queries";

export async function fetchStatesAction() {
    return await getStates();
}

export async function fetchCitiesAction(stateId: number) {
    if (!stateId) return [];
    return await getCitiesByState(stateId);
}

import { getJson, getJsonOrUndefined } from "../api/http";
import type { Leverans } from "../types/leverans";

export const leveransRepository = {
    /** All deliveries, newest first */
    getAll(): Promise<Leverans[]> {
        return getJson<Leverans[]>("/leveranser");
    },

    /** The deliveries that include the given application, newest first */
    getForApplication(applikationId: number): Promise<Leverans[]> {
        return getJson<Leverans[]>(`/leveranser?applikation=${encodeURIComponent(applikationId)}`);
    },

    /** Resolves to `undefined` when no delivery has the given id */
    getById(id: number): Promise<Leverans | undefined> {
        return getJsonOrUndefined<Leverans>(`/leveranser/${id}`);
    },
};

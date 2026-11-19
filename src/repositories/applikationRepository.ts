import { getJson } from "../api/http";
import { tillRader, type ApplikationRad, type ApplikationerSvar } from "../types/applikation";
import type { ApplikationsVersion } from "../types/leverans";

/** The response as it comes, grouped by subsystem */
function getAll(): Promise<ApplikationerSvar> {
    return getJson<ApplikationerSvar>("/applikationer");
}

export const applikationRepository = {
    getAll,

    /** All applications as flat rows, one per application */
    async getRows(): Promise<ApplikationRad[]> {
        return tillRader(await getAll());
    },

    /**
     * Resolves to `undefined` when no application has the given id. The
     * backend has no endpoint for one application, so the list is searched.
     */
    async getById(id: number): Promise<ApplikationRad | undefined> {
        return (await this.getRows()).find((rad) => rad.id === id);
    },

    /** The application's versions, newest first, with the packages in each */
    getVersions(id: number): Promise<ApplikationsVersion[]> {
        return getJson<ApplikationsVersion[]>(`/applikationer/${id}/versioner`);
    },
};

import { tillRader, type ApplikationRad, type ApplikationerSvar } from "../types/applikation";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Behaves like the backend: getAll() returns the response as it comes, grouped
 * by subsystem. Swap the import for an HTTP call later.
 */
async function getAll(): Promise<ApplikationerSvar> {
    const module = await import("../mock/applikationer.json");
    await delay(400);
    return structuredClone(module.default) as ApplikationerSvar;
}

export const applikationRepository = {
    getAll,

    /** All applications as flat rows, one per application */
    async getRows(): Promise<ApplikationRad[]> {
        return tillRader(await getAll());
    },

    /** Resolves to `undefined` when no application has the given id */
    async getById(id: number): Promise<ApplikationRad | undefined> {
        return (await this.getRows()).find((rad) => rad.id === id);
    },
};

import { getJson, getJsonOrUndefined } from "../api/http";
import type { Subsystem } from "../types/subsystem";

export const subsystemRepository = {
    getAll(): Promise<Subsystem[]> {
        return getJson<Subsystem[]>("/delsystem");
    },

    /** Resolves to `undefined` when no subsystem has the given id */
    getById(id: number): Promise<Subsystem | undefined> {
        return getJsonOrUndefined<Subsystem>(`/delsystem/${id}`);
    },
};

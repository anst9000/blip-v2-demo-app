import type { Subsystem } from "../types/subsystem";
import { createMockRepository } from "./mockRepository";

export const subsystemRepository = createMockRepository<Subsystem>(
    () => import("../mock/subsystems.json"),
);

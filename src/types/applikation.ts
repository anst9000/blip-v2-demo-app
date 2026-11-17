/*
 * The applications as the backend returns them: a list of subsystems (delsystem),
 * each with its applications.
 */

/** One application in a subsystem */
export interface Applikation {
    id: number;
    /** E.g. "ABC_SUP_REGLER": subsystem code, area and function */
    namn: string;
    arkiverad: boolean;
    /** The release the application is decommissioned in, YYYYMMDDNN; null when not planned */
    avvecklingsRelease: string | null;
    bestallbar: boolean;
    releaseBunden: boolean;
    testApplikation: boolean;
}

/** A subsystem with its applications */
export interface DelsystemMedApplikationer {
    /** Subsystem code, e.g. "ABC" */
    id: string;
    /** Subsystem name, e.g. "Abrakadabra" */
    delsystem: string;
    applikationerna: Applikation[];
}

/** The whole response */
export type ApplikationerSvar = DelsystemMedApplikationer[];

/**
 * One application with its subsystem, for tables and detail pages.
 * The subsystem fields are not named "...Id", so the list search includes them.
 */
export interface ApplikationRad extends Applikation {
    delsystemKod: string;
    delsystemNamn: string;
}

/** Flattens the response to one row per application */
export function tillRader(svar: ApplikationerSvar): ApplikationRad[] {
    return svar.flatMap((grupp) =>
        grupp.applikationerna.map((applikation) => ({
            ...applikation,
            delsystemKod: grupp.id,
            delsystemNamn: grupp.delsystem,
        })),
    );
}

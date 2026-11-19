/*
 * Packages, application versions and deliveries, as the backend returns them.
 * See BEGREPP.md for what the terms mean.
 */

/** What a package contains */
export type PaketTyp = "server" | "webb" | "databas" | "konfiguration" | "batch";

/** One built rpm package: name, version, release and architecture */
export interface PaketVersion {
    /** Package name, e.g. "abc-sup-regler" */
    paket: string;
    typ: PaketTyp;
    /** The software version, e.g. "3.4.1" */
    version: string;
    /** The packaging of that version, e.g. "2.el9" */
    release: string;
    arkitektur: "noarch" | "x86_64";
}

/** The rpm file name, e.g. "abc-sup-regler-3.4.1-2.el9.noarch.rpm" */
export function rpmFilnamn(paket: PaketVersion): string {
    return `${paket.paket}-${paket.version}-${paket.release}.${paket.arkitektur}.rpm`;
}

/** An application version: the packages, in exact versions, that make it up */
export interface ApplikationsVersion {
    /** E.g. "3.4" */
    version: string;
    /** When the version was built, YYYY-MM-DD */
    datum: string;
    paket: PaketVersion[];
}

export type Miljo = "Test" | "Acceptanstest" | "Produktion";

export type LeveransStatus = "Planerad" | "Levererad" | "Installerad";

/** An application version included in a delivery */
export interface LevereradApplikation {
    /** The application id */
    id: number;
    namn: string;
    delsystemKod: string;
    version: string;
    paket: PaketVersion[];
}

/** A set of packages, in exact versions, handed over to be installed in an environment */
export interface Leverans {
    id: number;
    /** E.g. "2026-03-AT" */
    namn: string;
    mal: Miljo;
    status: LeveransStatus;
    /** Planned or actual installation date, YYYY-MM-DD */
    datum: string;
    applikationer: LevereradApplikation[];
}

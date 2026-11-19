import type { LeveransStatus, Miljo } from "../types/leverans";
import type { Environment } from "../types/subsystem";

export type BadgeStatus = "default" | "warning" | "error" | "success" | "info";

/** Yes/no in Swedish, for boolean fields */
export function jaNej(value: boolean): string {
    return value ? "Ja" : "Nej";
}

export function environmentBadge(environment: Environment): BadgeStatus {
    return environment === "Produktion" ? "success" : environment === "Test" ? "warning" : "info";
}

export function miljoBadge(mal: Miljo): BadgeStatus {
    return mal === "Produktion" ? "success" : mal === "Acceptanstest" ? "info" : "warning";
}

export function leveransStatusBadge(status: LeveransStatus): BadgeStatus {
    return status === "Installerad" ? "success" : status === "Levererad" ? "info" : "default";
}

/** Today as YYYY-MM-DD, in local time */
export function today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The parts of a release id in the form YYYYMMDDNN */
interface ReleaseParts {
    /** YYYY-MM, or YYYY-MM-DD when the release has a day */
    datum: string;
    /** The release number that day or month, 0 when not given */
    nummer: number;
}

function parseRelease(release: string): ReleaseParts | undefined {
    const match = /^(\d{4})(\d{2})(\d{2})(\d{2})$/.exec(release);
    if (!match) {
        return undefined;
    }
    const [, year, month, day, number] = match;
    return {
        datum: day === "00" ? `${year}-${month}` : `${year}-${month}-${day}`,
        nummer: Number(number),
    };
}

/**
 * A release id (YYYYMMDDNN) in a readable form: "2015030000" → "2015-03",
 * "2014112000" → "2014-11-20", "2014112002" → "2014-11-20 nr 2".
 * Anything else is shown as it is.
 */
export function formatRelease(release: string): string {
    const parts = parseRelease(release);
    if (!parts) {
        return release;
    }
    return parts.nummer > 0 ? `${parts.datum} nr ${parts.nummer}` : parts.datum;
}

/**
 * True when the release is in the past. A release without a day counts as
 * passed once its month is over.
 */
export function releasePassed(release: string, todayIso = today()): boolean {
    const parts = parseRelease(release);
    if (!parts) {
        return false;
    }
    return parts.datum.length === 7 ? parts.datum < todayIso.slice(0, 7) : parts.datum < todayIso;
}

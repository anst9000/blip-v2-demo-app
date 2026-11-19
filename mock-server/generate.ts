/*
 * Builds made-up packages, application versions and deliveries from the
 * applications in data/applikationer.json. The same input always gives the
 * same output (a seeded random generator), so links stay valid between runs.
 *
 * The model, see BEGREPP.md:
 * - Each application is built to 1-4 rpm packages (server, webb, databas, ...).
 * - Once a month a few active applications get a new version. Only the
 *   packages that changed are rebuilt; the rest keep their earlier version.
 * - The new versions are delivered to Test, then Acceptanstest, then Produktion.
 */
import type { Applikation, ApplikationerSvar } from "../src/types/applikation.ts";
import type {
    ApplikationsVersion,
    Leverans,
    LeveransStatus,
    LevereradApplikation,
    Miljo,
    PaketTyp,
    PaketVersion,
} from "../src/types/leverans.ts";

/** A small seeded random generator (mulberry32), returns 0 <= x < 1 */
function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
    return `${year}-${pad(month)}-${pad(day)}`;
}

/** The packages an application is built to, guessed from its name */
function packageTypes(applikation: Applikation, random: () => number): PaketTyp[] {
    const types: PaketTyp[] = ["server"];
    const [, area, func] = applikation.namn.split("_");
    if (area === "WEB" || func === "ADMIN" || func === "PORTAL" || random() < 0.2) {
        types.push("webb");
    }
    if (random() < 0.5) {
        types.push("databas");
    }
    if (random() < 0.4) {
        types.push("konfiguration");
    }
    if (area === "BAT" || func === "IMPORT" || func === "EXPORT") {
        types.push("batch");
    }
    return types;
}

function packageName(applikation: Applikation, typ: PaketTyp): string {
    const base = applikation.namn.toLowerCase().replaceAll("_", "-");
    const suffix = { server: "", webb: "-web", databas: "-db", konfiguration: "-config", batch: "-batch" }[typ];
    return base + suffix;
}

interface AppState {
    applikation: Applikation & { delsystemKod: string };
    versions: ApplikationsVersion[];
}

export interface MockData {
    /** Application id → its versions, newest first */
    versioner: Map<number, ApplikationsVersion[]>;
    /** Newest first */
    leveranser: Leverans[];
}

/** The months with a release, from September 2025 to January 2027 */
function releaseMonths(): Array<{ year: number; month: number }> {
    const months = [];
    for (let i = 0; i < 17; i++) {
        const index = 2025 * 12 + 8 + i; // September 2025 = month index 8
        months.push({ year: Math.floor(index / 12), month: (index % 12) + 1 });
    }
    return months;
}

function statusFor(datum: string, today: string): LeveransStatus {
    if (datum > today) {
        return "Planerad";
    }
    const days = (Date.parse(today) - Date.parse(datum)) / 86_400_000;
    return days <= 7 ? "Levererad" : "Installerad";
}

export function generate(svar: ApplikationerSvar, today = new Date().toISOString().slice(0, 10)): MockData {
    const random = createRandom(20261119);
    const states: AppState[] = [];

    /* ---------- The first version of every application ---------- */

    for (const grupp of svar) {
        for (const applikation of grupp.applikationerna) {
            const types = packageTypes(applikation, random);
            const major = 1 + Math.floor(random() * 4);
            const minor = Math.floor(random() * 10);
            // Archived applications were last built years ago, on an older OS
            const year = applikation.arkiverad ? 2019 + Math.floor(random() * 4) : 2024;
            const dist = applikation.arkiverad ? "el8" : "el9";
            const datum = isoDate(year, 1 + Math.floor(random() * 12), 1 + Math.floor(random() * 28));
            const paket = types.map((typ) => ({
                paket: packageName(applikation, typ),
                typ,
                version: `${major}.${minor}.${typ === "server" ? Math.floor(random() * 3) : 0}`,
                release: `${1 + Math.floor(random() * 2)}.${dist}`,
                arkitektur: typ === "server" && random() < 0.15 ? ("x86_64" as const) : ("noarch" as const),
            }));
            states.push({
                applikation: { ...applikation, delsystemKod: grupp.id },
                versions: [{ version: `${major}.${minor}`, datum, paket }],
            });
        }
    }

    /* ---------- Monthly releases: new versions, delivered three times ---------- */

    const active = states.filter((state) => !state.applikation.arkiverad);
    const leveranser: Leverans[] = [];
    const stages: Array<{ mal: Miljo; kod: string; day: number }> = [
        { mal: "Test", kod: "T", day: 6 },
        { mal: "Acceptanstest", kod: "AT", day: 14 },
        { mal: "Produktion", kod: "P", day: 25 },
    ];

    for (const { year, month } of releaseMonths()) {
        const count = 2 + Math.floor(random() * 4);
        const chosen = [...active].sort(() => random() - 0.5).slice(0, count);
        const built = isoDate(year, month, 2);

        const levererade: LevereradApplikation[] = chosen.map((state) => {
            const previous = state.versions[0];
            const [major, minor] = previous.version.split(".").map(Number);
            const version = random() < 0.15 ? `${major + 1}.0` : `${major}.${minor + 1}`;
            const paket: PaketVersion[] = previous.paket.map((old) => {
                // The server package is always rebuilt; the others only when they changed
                if (old.typ !== "server" && random() < 0.5) {
                    return old;
                }
                const patch = old.typ === "server" ? Math.floor(random() * 3) : 0;
                return {
                    ...old,
                    version: `${version}.${patch}`,
                    release: `${1 + Math.floor(random() * 2)}.el9`,
                };
            });
            state.versions.unshift({ version, datum: built, paket });
            return {
                id: state.applikation.id,
                namn: state.applikation.namn,
                delsystemKod: state.applikation.delsystemKod,
                version,
                paket,
            };
        });
        levererade.sort((a, b) => a.namn.localeCompare(b.namn, "sv"));

        for (const stage of stages) {
            const datum = isoDate(year, month, stage.day);
            leveranser.push({
                id: 1000 + leveranser.length + 1,
                namn: `${year}-${pad(month)}-${stage.kod}`,
                mal: stage.mal,
                status: statusFor(datum, today),
                datum,
                applikationer: levererade,
            });
        }
    }

    leveranser.sort((a, b) => b.datum.localeCompare(a.datum));
    return {
        versioner: new Map(states.map((state) => [state.applikation.id, state.versions])),
        leveranser,
    };
}

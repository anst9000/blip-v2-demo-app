/*
 * A mock backend that runs inside Vite's dev and preview servers, so the app
 * talks to it over real HTTP (fetch) at http://localhost:<port>/api/...
 * Point VITE_API_URL at a real backend to stop using it.
 *
 * Endpoints (all GET, JSON):
 *   /api/applikationer                    the subsystems with their applications
 *   /api/applikationer/:id/versioner      an application's versions with their packages
 *   /api/leveranser[?applikation=:id]     all deliveries, or those including an application
 *   /api/leveranser/:id                   one delivery
 *   /api/delsystem                        the subsystems (old demo data)
 *   /api/delsystem/:id                    one subsystem
 *
 * Every answer is delayed to feel like a network. Add ?fel=500 (or another
 * status) to any URL to get an error answer instead.
 */
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import type { ApplikationerSvar } from "../src/types/applikation.ts";
import { generate } from "./generate.ts";

const DELAY_MS = 300;

function readJson<T>(file: string): T {
    return JSON.parse(readFileSync(new URL(`./data/${file}`, import.meta.url), "utf8")) as T;
}

interface Subsystem {
    id: number;
}

/** Answers a request to one endpoint; params are the groups in its pattern */
type Handler = (params: string[], query: URLSearchParams) => { status: number; body: unknown };

function createRoutes(): Array<[RegExp, Handler]> {
    const applikationer = readJson<ApplikationerSvar>("applikationer.json");
    const delsystem = readJson<Subsystem[]>("delsystem.json");
    const { versioner, leveranser } = generate(applikationer);

    const ok = (body: unknown) => ({ status: 200, body });
    const notFound = (what: string) => ({ status: 404, body: { meddelande: `${what} finns inte` } });

    return [
        [/^\/applikationer$/, () => ok(applikationer)],
        [
            /^\/applikationer\/(\d+)\/versioner$/,
            ([id]) => {
                const found = versioner.get(Number(id));
                return found ? ok(found) : notFound(`Applikation ${id}`);
            },
        ],
        [
            /^\/leveranser$/,
            (_params, query) => {
                const applikation = query.get("applikation");
                if (applikation === null) {
                    return ok(leveranser);
                }
                const id = Number(applikation);
                return ok(leveranser.filter((leverans) => leverans.applikationer.some((app) => app.id === id)));
            },
        ],
        [
            /^\/leveranser\/(\d+)$/,
            ([id]) => {
                const found = leveranser.find((leverans) => leverans.id === Number(id));
                return found ? ok(found) : notFound(`Leverans ${id}`);
            },
        ],
        [/^\/delsystem$/, () => ok(delsystem)],
        [
            /^\/delsystem\/(\d+)$/,
            ([id]) => {
                const found = delsystem.find((item) => item.id === Number(id));
                return found ? ok(found) : notFound(`Delsystem ${id}`);
            },
        ],
    ];
}

function send(res: ServerResponse, status: number, body: unknown): void {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
}

function createMiddleware(): Connect.NextHandleFunction {
    let routes: Array<[RegExp, Handler]> | undefined;

    return (req: IncomingMessage, res: ServerResponse) => {
        // Mounted on /api, so req.url is the rest, e.g. "/leveranser?applikation=9765"
        const url = new URL(req.url ?? "/", "http://mock");
        routes ??= createRoutes();
        const route = routes.find(([pattern]) => pattern.test(url.pathname));
        if (!route) {
            send(res, 404, { meddelande: `Okänd adress: /api${url.pathname}` });
            return;
        }
        setTimeout(() => {
            const forcedError = Number(url.searchParams.get("fel"));
            if (forcedError >= 400) {
                send(res, forcedError, { meddelande: `Simulerat fel ${forcedError}` });
            } else if (req.method !== "GET") {
                send(res, 405, { meddelande: "Bara GET stöds" });
            } else {
                const params = url.pathname.match(route[0])?.slice(1) ?? [];
                const { status, body } = route[1](params, url.searchParams);
                send(res, status, body);
            }
        }, DELAY_MS);
    };
}

export function mockBackend(): Plugin {
    return {
        name: "blip-mock-backend",
        configureServer(server) {
            server.middlewares.use("/api", createMiddleware());
        },
        configurePreviewServer(server) {
            server.middlewares.use("/api", createMiddleware());
        },
    };
}

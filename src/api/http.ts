/*
 * Fetches JSON from the backend. The base URL comes from VITE_API_URL; without
 * it the mock backend on /api is used (see mock-server/plugin.ts).
 */

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

/** The backend answered with an error status */
export class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/** The error text in the answer body, if the backend sent one */
async function errorText(response: Response): Promise<string> {
    try {
        const body: unknown = await response.json();
        if (body && typeof body === "object" && "meddelande" in body && typeof body.meddelande === "string") {
            return body.meddelande;
        }
    } catch {
        /* not JSON */
    }
    return response.statusText;
}

/**
 * GET `path` (e.g. "/leveranser") and parse the answer as JSON.
 * Throws HttpError for error statuses and an Error with a readable text when
 * the server cannot be reached.
 */
export async function getJson<T>(path: string, init?: { signal?: AbortSignal }): Promise<T> {
    let response: Response;
    try {
        response = await fetch(BASE_URL + path, {
            headers: { Accept: "application/json" },
            signal: init?.signal,
        });
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
            throw e;
        }
        throw new Error("Kunde inte nå servern. Kontrollera nätverket och försök igen.", { cause: e });
    }
    if (!response.ok) {
        const text = await errorText(response);
        throw new HttpError(response.status, `Servern svarade ${response.status}${text ? `: ${text}` : ""}`);
    }
    return (await response.json()) as T;
}

/** Like getJson, but resolves to `undefined` when the backend answers 404 */
export async function getJsonOrUndefined<T>(path: string): Promise<T | undefined> {
    try {
        return await getJson<T>(path);
    } catch (e) {
        if (e instanceof HttpError && e.status === 404) {
            return undefined;
        }
        throw e;
    }
}

/*
 * Search rules used by the lists.
 */

function isSearchable(key: string, value: unknown): value is string | number {
    // ids are internal and would give confusing matches
    if (key === "id" || key.endsWith("Id")) {
        return false;
    }
    return typeof value === "string" || typeof value === "number";
}

/** Lower-cased text of all the row's text and number fields */
export function rowSearchText(row: object): string {
    return Object.entries(row)
        .filter(([key, value]) => isSearchable(key, value))
        .map(([, value]) => String(value).toLowerCase())
        .join(" ");
}

/** Splits a search into lower-cased words; an empty array means "no search" */
export function searchWords(search: string): string[] {
    return search.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every word must appear somewhere in the row's search text */
export function matchesAllWords(searchText: string, words: string[]): boolean {
    return words.every((word) => searchText.includes(word));
}


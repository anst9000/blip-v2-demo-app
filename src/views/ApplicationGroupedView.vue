<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { FMessageBox, FSearchTextField, FTable, defineTableColumns } from "@fkui/vue";
import { useListQuery } from "../composables/useListQuery";
import { useResource } from "../composables/useResource";
import { matchesAllWords, searchWords } from "../utils/rowSearch";
import { jaNej } from "../composables/formatters";
import { applikationRepository } from "../repositories/applikationRepository";
import type { Applikation, ApplikationerSvar } from "../types/applikation";

const router = useRouter();

/**
 * One row in the grouped table: a subsystem (with its applications as nested
 * rows) or an application. FTable shows the nested rows when the subsystem
 * row is expanded; both kinds share the same columns.
 */
interface GruppRad {
    /** Unique key: the subsystem code, or the application id */
    key: string;
    /** Set on subsystem rows */
    delsystem?: string;
    /** Set on application rows */
    applikation?: Applikation;
    /** The applications in a subsystem (only the matching ones during a search) */
    rader?: GruppRad[];
    /** Number of applications in the subsystem, matching or not */
    totalt?: number;
}

const { data, loading, error } = useResource(applikationRepository.getAll);

/* The search is kept in the URL (?sok=...), like in the other lists */
const { search, searchText } = useListQuery("", {});

/**
 * Groups the response for the table. During a search an application is kept
 * when every word is found in its name or in its subsystem's name or code, so
 * searching for a subsystem shows all its applications. Subsystems without
 * any match are left out.
 */
function tillGrupper(svar: ApplikationerSvar, words: string[]): GruppRad[] {
    return [...svar]
        .sort((a, b) => a.delsystem.localeCompare(b.delsystem, "sv"))
        .map((grupp) => ({
            key: grupp.id,
            delsystem: `${grupp.delsystem} (${grupp.id})`,
            totalt: grupp.applikationerna.length,
            rader: grupp.applikationerna
                .filter((applikation) =>
                    matchesAllWords(`${applikation.namn} ${grupp.delsystem} ${grupp.id}`.toLowerCase(), words),
                )
                .map((applikation) => ({ key: String(applikation.id), applikation })),
        }))
        .filter((grupp) => grupp.rader.length > 0);
}

const words = computed(() => searchWords(search.value));
const isSearching = computed(() => words.value.length > 0);
const rows = computed(() => (data.value ? tillGrupper(data.value, words.value) : []));
const antalApplikationer = computed(() => rows.value.reduce((sum, row) => sum + (row.rader?.length ?? 0), 0));
const totaltApplikationer = computed(() =>
    (data.value ?? []).reduce((sum, grupp) => sum + grupp.applikationerna.length, 0),
);

/*
 * During a search the matching subsystems are opened, so the hits are seen at
 * once. FTable has no prop for expanded rows, so this presses the expand
 * buttons of the closed subsystem rows, then gives focus back to the search
 * field.
 */
const tableWrapper = useTemplateRef<HTMLElement>("tableWrapper");
watch(
    rows,
    async () => {
        if (!isSearching.value) {
            return;
        }
        await nextTick();
        const focused = document.activeElement;
        tableWrapper.value
            ?.querySelectorAll<HTMLButtonElement>('tr[aria-level="1"] button[aria-expanded="false"]')
            .forEach((button) => button.click());
        if (focused instanceof HTMLElement) {
            focused.focus();
        }
    },
    { flush: "post" },
);

/** Yes/no for application rows, empty on subsystem rows */
const flagga = (row: GruppRad, field: "bestallbar" | "testApplikation" | "releaseBunden" | "arkiverad"): string =>
    row.applikation ? jaNej(row.applikation[field]) : "";

const columns = defineTableColumns<GruppRad>([
    { header: "Delsystem", type: "text", value: (row) => row.delsystem ?? "" },
    {
        header: "Applikation",
        type: "anchor",
        /* An empty text gives an empty cell, so subsystem rows have no link */
        text: (row) => row.applikation?.namn ?? "",
        href: (row) =>
            row.applikation
                ? router.resolve({ name: "applikation", params: { id: row.applikation.id } }).href
                : "",
    },
    {
        header: "Antal",
        type: "text",
        size: "shrink",
        /* "2 av 4" during a search, when not all applications in the subsystem match */
        value: (row) => {
            if (!row.rader) {
                return "";
            }
            const shown = row.rader.length;
            return shown === row.totalt ? String(shown) : `${shown} av ${row.totalt}`;
        },
    },
    { header: "Beställbar", type: "text", size: "shrink", value: (row) => flagga(row, "bestallbar") },
    { header: "Testapplikation", type: "text", size: "shrink", value: (row) => flagga(row, "testApplikation") },
    { header: "Releasebunden", type: "text", size: "shrink", value: (row) => flagga(row, "releaseBunden") },
    { header: "Arkiverad", type: "text", size: "shrink", value: (row) => flagga(row, "arkiverad") },
    {
        header: "Avvecklingsrelease",
        type: "text",
        size: "shrink",
        value: (row) => (row.applikation ? (row.applikation.avvecklingsRelease ?? "–") : ""),
    },
]);
</script>

<template>
    <h1>Applikationer per delsystem</h1>
    <p>
        Samma applikationer som i
        <router-link :to="{ name: 'applikationer' }">listan över alla applikationer</router-link>,
        grupperade per delsystem. Expandera ett delsystem för att se dess applikationer.
    </p>

    <p v-if="loading">Hämtar applikationer…</p>
    <f-message-box v-else-if="error" type="error">
        <template #default="{ headingSlotClass }">
            <h2 :class="headingSlotClass">Kunde inte hämta applikationer</h2>
            <p>{{ error }}</p>
        </template>
    </f-message-box>

    <template v-else>
        <div class="search">
            <f-search-text-field v-model="searchText">
                <template #default>Sök på applikation, delsystem eller kod</template>
            </f-search-text-field>
        </div>

        <div ref="tableWrapper">
            <f-table :rows :columns key-attribute="key" expandable-attribute="rader" striped>
                <template #caption>
                    <span aria-live="polite">
                        <template v-if="isSearching">
                            {{ antalApplikationer }} av {{ totaltApplikationer }} applikationer i
                            {{ rows.length }} delsystem matchar ”{{ search }}”
                        </template>
                        <template v-else>
                            {{ rows.length }} delsystem med sammanlagt {{ antalApplikationer }} applikationer
                        </template>
                    </span>
                </template>
                <template #empty>
                    {{ isSearching ? `Inga applikationer matchar ”${search}”.` : "Inga delsystem hittades." }}
                </template>
            </f-table>
        </div>
    </template>
</template>

<style scoped>
.search {
    max-width: 28rem;
}
</style>

<script setup lang="ts">
import { computed, h } from "vue";
import { type LocationQuery, useRoute, useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import ApplicationGroupedTable from "../components/ApplicationGroupedTable.vue";
import NewWindowLink from "../components/NewWindowLink.vue";
import PaginatedList from "../components/PaginatedList.vue";
import TabList from "../components/TabList.vue";
import { formatRelease, jaNej, releasePassed } from "../composables/formatters";
import { applikationRepository } from "../repositories/applikationRepository";
import type { ApplikationRad } from "../types/applikation";
import { INTERNT_SYSTEM_NAMN, internSystemUrl } from "../utils/internSystem";

const route = useRoute();
const router = useRouter();

/* ---------- Tabs: all applications, or grouped by subsystem ---------- */

type Tab = "alla" | "per-delsystem";

const tabs: Array<{ value: Tab; label: string }> = [
    { value: "alla", label: "Alla applikationer" },
    { value: "per-delsystem", label: "Grupperade per delsystem" },
];

/**
 * The chosen tab, kept in the URL (?visa=per-delsystem) so "back" from an
 * application returns to the same tab. Switching keeps the search but drops
 * the list's paging, sorting and filters, which only apply to the list.
 */
const tab = computed<Tab>({
    get: () => (route.query.visa === "per-delsystem" ? "per-delsystem" : "alla"),
    set: (value) => {
        const query: LocationQuery = {};
        if (typeof route.query.sok === "string") {
            query.sok = route.query.sok;
        }
        if (value !== "alla") {
            query.visa = value;
        }
        void router.replace({ query });
    },
});

/** Shows the release readably; "(passerad)" when an active application is past it */
function avveckling(row: ApplikationRad): string {
    if (!row.avvecklingsRelease) {
        return "–";
    }
    const text = formatRelease(row.avvecklingsRelease);
    return !row.arkiverad && releasePassed(row.avvecklingsRelease) ? `${text} (passerad)` : text;
}

/* The yes/no columns sort on the boolean (key) and show Ja/Nej (value) */
const columns = defineTableColumns<ApplikationRad>([
    {
        header: "Namn",
        type: "anchor",
        key: "namn",
        text: (row) => row.namn,
        href: (row) => router.resolve({ name: "applikation", params: { id: row.id } }).href,
    },
    {
        /* The application's page in another internal system, opened in a new window */
        header: INTERNT_SYSTEM_NAMN,
        size: "shrink",
        render: (row) =>
            h(NewWindowLink, {
                href: internSystemUrl(row.id),
                label: `Öppna ${row.namn} i ${INTERNT_SYSTEM_NAMN}`,
            }),
    },
    { header: "Delsystem", key: "delsystemNamn", type: "text" },
    { header: "Kod", key: "delsystemKod", type: "text", size: "shrink" },
    { header: "Beställbar", key: "bestallbar", type: "text", size: "shrink", value: (row) => jaNej(row.bestallbar) },
    {
        header: "Testapplikation",
        key: "testApplikation",
        type: "text",
        size: "shrink",
        value: (row) => jaNej(row.testApplikation),
    },
    {
        header: "Releasebunden",
        key: "releaseBunden",
        type: "text",
        size: "shrink",
        value: (row) => jaNej(row.releaseBunden),
    },
    { header: "Arkiverad", key: "arkiverad", type: "text", size: "shrink", value: (row) => jaNej(row.arkiverad) },
    {
        header: "Avvecklingsrelease",
        key: "avvecklingsRelease",
        type: "text",
        size: "shrink",
        value: avveckling,
    },
]);

/** Shown only when the user chooses them under "Kolumner" */
const defaultHidden = ["Testapplikation", "Releasebunden", "Arkiverad"];
</script>

<template>
    <h1>Applikationer</h1>
    <p>Påhittade applikationer. Klicka på en applikation för att se den.</p>

    <tab-list v-model="tab" label="Visa applikationer" id-prefix="applikationer" :tabs />

    <div
        :id="`applikationer-panel-${tab}`"
        role="tabpanel"
        :aria-labelledby="`applikationer-tab-${tab}`"
    >
        <template v-if="tab === 'per-delsystem'">
            <p>Expandera ett delsystem för att se dess applikationer.</p>
            <application-grouped-table />
        </template>

        <template v-else>
            <paginated-list
                list-id="applikationer"
                :load="applikationRepository.getRows"
                :columns
                :default-hidden
                noun="applikationer"
            />
        </template>
    </div>
</template>


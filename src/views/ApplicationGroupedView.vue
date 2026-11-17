<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { FMessageBox, FTable, defineTableColumns } from "@fkui/vue";
import { useResource } from "../composables/useResource";
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
    /** The applications in a subsystem */
    rader?: GruppRad[];
}

const { data, loading, error } = useResource(applikationRepository.getAll);

function tillGrupper(svar: ApplikationerSvar): GruppRad[] {
    return [...svar]
        .sort((a, b) => a.delsystem.localeCompare(b.delsystem, "sv"))
        .map((grupp) => ({
            key: grupp.id,
            delsystem: `${grupp.delsystem} (${grupp.id})`,
            rader: grupp.applikationerna.map((applikation) => ({
                key: String(applikation.id),
                applikation,
            })),
        }));
}

const rows = computed(() => (data.value ? tillGrupper(data.value) : []));
const antalApplikationer = computed(() => rows.value.reduce((sum, row) => sum + (row.rader?.length ?? 0), 0));

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
        value: (row) => (row.rader ? String(row.rader.length) : ""),
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

    <f-table v-else :rows :columns key-attribute="key" expandable-attribute="rader" striped>
        <template #caption>
            {{ rows.length }} delsystem med sammanlagt {{ antalApplikationer }} applikationer
        </template>
        <template #empty>Inga delsystem hittades.</template>
    </f-table>
</template>

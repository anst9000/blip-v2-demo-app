<script setup lang="ts">
import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import PaginatedList from "../components/PaginatedList.vue";
import { jaNej } from "../composables/formatters";
import { applikationRepository } from "../repositories/applikationRepository";
import type { ApplikationRad } from "../types/applikation";

const router = useRouter();

/* The yes/no columns sort on the boolean (key) and show Ja/Nej (value) */
const columns = defineTableColumns<ApplikationRad>([
    {
        header: "Namn",
        type: "anchor",
        key: "namn",
        text: (row) => row.namn,
        href: (row) => router.resolve({ name: "applikation", params: { id: row.id } }).href,
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
        value: (row) => row.avvecklingsRelease ?? "–",
    },
]);
</script>

<template>
    <h1>Applikationer</h1>
    <p>Påhittade applikationer, grupperade per delsystem. Klicka på en rad för att se applikationen.</p>
    <paginated-list list-id="applikationer" :load="applikationRepository.getRows" :columns noun="applikationer" />
</template>

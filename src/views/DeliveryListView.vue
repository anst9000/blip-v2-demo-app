<script setup lang="ts">
import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import PaginatedList from "../components/PaginatedList.vue";
import { leveransRepository } from "../repositories/leveransRepository";
import type { Leverans, LeveransStatus, Miljo } from "../types/leverans";

const router = useRouter();

/** One delivery as a flat row, so the list search finds applications and subsystems too */
interface LeveransRad {
    id: number;
    namn: string;
    mal: Miljo;
    status: LeveransStatus;
    datum: string;
    delsystem: string;
    applikationer: string;
    antalPaket: number;
}

async function load(): Promise<LeveransRad[]> {
    return (await leveransRepository.getAll()).map((leverans: Leverans) => ({
        id: leverans.id,
        namn: leverans.namn,
        mal: leverans.mal,
        status: leverans.status,
        datum: leverans.datum,
        delsystem: [...new Set(leverans.applikationer.map((app) => app.delsystemKod))].sort().join(", "),
        applikationer: leverans.applikationer.map((app) => `${app.namn} ${app.version}`).join(", "),
        antalPaket: leverans.applikationer.reduce((sum, app) => sum + app.paket.length, 0),
    }));
}

const columns = defineTableColumns<LeveransRad>([
    {
        header: "Leverans",
        type: "anchor",
        key: "namn",
        text: (row) => row.namn,
        href: (row) => router.resolve({ name: "leverans", params: { id: row.id } }).href,
        size: "shrink",
    },
    { header: "Mål", key: "mal", type: "text", size: "shrink" },
    { header: "Datum", key: "datum", type: "text:date", size: "shrink" },
    { header: "Status", key: "status", type: "text", size: "shrink" },
    { header: "Delsystem", key: "delsystem", type: "text", size: "shrink" },
    { header: "Applikationer", key: "applikationer", type: "text" },
    { header: "Paket", key: "antalPaket", type: "text:number", size: "shrink" },
]);
</script>

<template>
    <h1>Leveranser</h1>
    <p>
        En leverans är ett urval paket, i exakta versioner, som skickas för att installeras i en miljö.
        Varje månad får några applikationer nya versioner, som levereras först till test, sedan till
        acceptanstest och sist till produktion. Klicka på en rad för att se paketen.
    </p>
    <paginated-list list-id="leveranser" :load :columns noun="leveranser" />
</template>

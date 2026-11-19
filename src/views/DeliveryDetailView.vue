<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { FBadge, FDefinitionList, FTable, defineTableColumns } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { leveransStatusBadge, miljoBadge } from "../composables/formatters";
import { useResource } from "../composables/useResource";
import { leveransRepository } from "../repositories/leveransRepository";
import { rpmFilnamn, type PaketTyp } from "../types/leverans";

const props = defineProps<{ id: number }>();
const router = useRouter();

const { data: item, loading, error } = useResource(
    () => leveransRepository.getById(props.id),
    () => props.id,
);

const definitions = computed(() => {
    if (!item.value) {
        return [];
    }
    const apps = item.value.applikationer;
    const delsystem = [...new Set(apps.map((app) => app.delsystemKod))].sort();
    return [
        { term: "Mål", definition: item.value.mal },
        { term: item.value.status === "Planerad" ? "Planerad till" : "Datum", definition: item.value.datum },
        { term: "Delsystem", definition: delsystem.join(", ") },
        { term: "Applikationer", definition: String(apps.length) },
        { term: "Paket", definition: String(packageRows.value.length) },
    ];
});

/** One row per package, with the application it belongs to */
interface PaketRad {
    fil: string;
    typ: PaketTyp;
    applikationId: number;
    applikation: string;
    applikationsVersion: string;
    delsystemKod: string;
}

const packageRows = computed<PaketRad[]>(() =>
    (item.value?.applikationer ?? []).flatMap((app) =>
        app.paket.map((paket) => ({
            fil: rpmFilnamn(paket),
            typ: paket.typ,
            applikationId: app.id,
            applikation: app.namn,
            applikationsVersion: app.version,
            delsystemKod: app.delsystemKod,
        })),
    ),
);

const columns = defineTableColumns<PaketRad>([
    { header: "Paket", type: "text", value: (row) => row.fil },
    { header: "Innehåll", type: "text", size: "shrink", value: (row) => row.typ },
    {
        header: "Applikation",
        type: "anchor",
        text: (row) => `${row.applikation} ${row.applikationsVersion}`,
        href: (row) => router.resolve({ name: "applikation", params: { id: row.applikationId } }).href,
    },
    { header: "Delsystem", type: "text", size: "shrink", value: (row) => row.delsystemKod },
]);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'leveranser' }"
        back-label="Alla leveranser"
    >
        <template v-if="item">
            <h1>Leverans {{ item.namn }}</h1>
            <p class="badges">
                <f-badge :status="miljoBadge(item.mal)">{{ item.mal }}</f-badge>
                <f-badge :status="leveransStatusBadge(item.status)">{{ item.status }}</f-badge>
            </p>
            <f-definition-list :definitions />

            <h2>Paket</h2>
            <f-table :rows="packageRows" :columns key-attribute="fil" striped>
                <template #caption>{{ packageRows.length }} paket i leveransen</template>
                <template #empty>Leveransen innehåller inga paket.</template>
            </f-table>
        </template>
    </detail-page>
</template>

<style scoped>
.badges {
    display: flex;
    gap: 0.5rem;
}
</style>

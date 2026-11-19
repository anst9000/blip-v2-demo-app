<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { FBadge, FDefinitionList, FMessageBox, FTable, defineTableColumns } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { useResource } from "../composables/useResource";
import { formatRelease, jaNej, releasePassed, today } from "../composables/formatters";
import { applikationRepository } from "../repositories/applikationRepository";
import { leveransRepository } from "../repositories/leveransRepository";
import { rpmFilnamn, type ApplikationsVersion, type Leverans, type PaketVersion } from "../types/leverans";

const props = defineProps<{ id: number }>();
const router = useRouter();

const { data: item, loading, error } = useResource(
    () => applikationRepository.getById(props.id),
    () => props.id,
);
const versions = useResource(
    () => applikationRepository.getVersions(props.id),
    () => props.id,
);
const deliveries = useResource(
    () => leveransRepository.getForApplication(props.id),
    () => props.id,
);

function avveckling(release: string | null): string {
    if (!release) {
        return "Ingen planerad";
    }
    return releasePassed(release) ? `${formatRelease(release)} (passerad)` : formatRelease(release);
}

const definitions = computed(() =>
    item.value
        ? [
              { term: "Delsystem", definition: `${item.value.delsystemNamn} (${item.value.delsystemKod})` },
              { term: "Senaste version", definition: current.value?.version ?? "–" },
              { term: "Beställbar", definition: jaNej(item.value.bestallbar) },
              { term: "Testapplikation", definition: jaNej(item.value.testApplikation) },
              { term: "Releasebunden", definition: jaNej(item.value.releaseBunden) },
              { term: "Avvecklingsrelease", definition: avveckling(item.value.avvecklingsRelease) },
              { term: "Id", definition: String(item.value.id) },
          ]
        : [],
);

/* ---------- Versions and packages ---------- */

/** The newest version that is built; later ones are planned (not built yet) */
const current = computed<ApplikationsVersion | undefined>(() => {
    const todayIso = today();
    return versions.data.value?.find((version) => version.datum <= todayIso);
});

const packageColumns = defineTableColumns<PaketVersion>([
    { header: "Paket", type: "text", value: (row) => row.paket },
    { header: "Innehåll", type: "text", size: "shrink", value: (row) => row.typ },
    { header: "Version", type: "text", size: "shrink", value: (row) => `${row.version}-${row.release}` },
    { header: "Fil", type: "text", value: rpmFilnamn },
]);

interface VersionRow extends ApplikationsVersion {
    status: string;
}

const versionRows = computed<VersionRow[]>(() =>
    (versions.data.value ?? []).map((version) => ({
        ...version,
        status: version === current.value ? "Senaste" : version.datum > today() ? "Planerad" : "",
    })),
);

const versionColumns = defineTableColumns<VersionRow>([
    { header: "Version", type: "text", size: "shrink", value: (row) => row.version },
    { header: "Byggd", type: "text", size: "shrink", value: (row) => row.datum },
    { header: "Status", type: "text", size: "shrink", value: (row) => row.status },
    {
        header: "Paketversioner",
        type: "text",
        value: (row) => row.paket.map((p) => `${p.paket} ${p.version}-${p.release}`).join(", "),
    },
]);

/* ---------- Deliveries ---------- */

const deliveryColumns = defineTableColumns<Leverans>([
    {
        header: "Leverans",
        type: "anchor",
        text: (row) => row.namn,
        href: (row) => router.resolve({ name: "leverans", params: { id: row.id } }).href,
    },
    { header: "Mål", type: "text", size: "shrink", value: (row) => row.mal },
    { header: "Datum", type: "text", size: "shrink", value: (row) => row.datum },
    { header: "Status", type: "text", size: "shrink", value: (row) => row.status },
    {
        header: "Version",
        type: "text",
        size: "shrink",
        value: (row) => row.applikationer.find((app) => app.id === props.id)?.version ?? "",
    },
]);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'applikationer' }"
        back-label="Alla applikationer"
    >
        <template v-if="item">
            <h1>{{ item.namn }}</h1>
            <p>
                Status:
                <f-badge :status="item.arkiverad ? 'default' : 'success'">
                    {{ item.arkiverad ? "Arkiverad" : "Aktiv" }}
                </f-badge>
            </p>
            <f-definition-list :definitions />

            <section class="section">
                <h2>Paket</h2>
                <p v-if="versions.loading.value">Hämtar paket…</p>
                <f-message-box v-else-if="versions.error.value" type="error">
                    <template #default="{ headingSlotClass }">
                        <h3 :class="headingSlotClass">Kunde inte hämta versioner</h3>
                        <p>{{ versions.error.value }}</p>
                    </template>
                </f-message-box>
                <template v-else>
                    <p>
                        Den senaste versionen, {{ current?.version }}, består av
                        {{ current?.paket.length ?? 0 }} paket:
                    </p>
                    <f-table :rows="current?.paket ?? []" :columns="packageColumns" key-attribute="paket" striped>
                        <template #caption>Paket i version {{ current?.version }}</template>
                        <template #empty>Inga paket.</template>
                    </f-table>

                    <h2>Versioner</h2>
                    <p>
                        En applikationsversion är en kombination av paketversioner. Paket som inte ändrats
                        behåller sin tidigare version.
                    </p>
                    <f-table :rows="versionRows" :columns="versionColumns" key-attribute="version" striped>
                        <template #caption>{{ versionRows.length }} versioner, nyast först</template>
                        <template #empty>Inga versioner.</template>
                    </f-table>
                </template>
            </section>

            <section class="section">
                <h2>Leveranser</h2>
                <p v-if="deliveries.loading.value">Hämtar leveranser…</p>
                <f-message-box v-else-if="deliveries.error.value" type="error">
                    <template #default="{ headingSlotClass }">
                        <h3 :class="headingSlotClass">Kunde inte hämta leveranser</h3>
                        <p>{{ deliveries.error.value }}</p>
                    </template>
                </f-message-box>
                <f-table
                    v-else
                    :rows="deliveries.data.value ?? []"
                    :columns="deliveryColumns"
                    key-attribute="id"
                    striped
                >
                    <template #caption>Leveranser som innehåller {{ item.namn }}</template>
                    <template #empty>Applikationen har inte levererats.</template>
                </f-table>
            </section>
        </template>
    </detail-page>
</template>

<style scoped>
.section {
    margin-top: 2rem;
}
</style>

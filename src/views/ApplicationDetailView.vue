<script setup lang="ts">
import { computed } from "vue";
import { FBadge, FDefinitionList } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { useResource } from "../composables/useResource";
import { jaNej } from "../composables/formatters";
import { applikationRepository } from "../repositories/applikationRepository";

const props = defineProps<{ id: number }>();

const { data: item, loading, error } = useResource(
    () => applikationRepository.getById(props.id),
    () => props.id,
);

const definitions = computed(() =>
    item.value
        ? [
              { term: "Delsystem", definition: `${item.value.delsystemNamn} (${item.value.delsystemKod})` },
              { term: "Beställbar", definition: jaNej(item.value.bestallbar) },
              { term: "Testapplikation", definition: jaNej(item.value.testApplikation) },
              { term: "Releasebunden", definition: jaNej(item.value.releaseBunden) },
              { term: "Avvecklingsrelease", definition: item.value.avvecklingsRelease ?? "Ingen planerad" },
              { term: "Id", definition: String(item.value.id) },
          ]
        : [],
);
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
        </template>
    </detail-page>
</template>

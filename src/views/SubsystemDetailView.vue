<script setup lang="ts">
import { computed } from "vue";
import { FBadge, FDefinitionList } from "@fkui/vue";
import DetailPage from "../components/DetailPage.vue";
import { useResource } from "../composables/useResource";
import { environmentBadge } from "../composables/formatters";
import { subsystemRepository } from "../repositories/subsystemRepository";

const props = defineProps<{ id: number }>();

const { data: item, loading, error } = useResource(
    () => subsystemRepository.getById(props.id),
    () => props.id,
);

const definitions = computed(() =>
    item.value
        ? [
              { term: "Kod", definition: item.value.code },
              { term: "Team", definition: item.value.team },
              { term: "Version", definition: item.value.version },
              { term: "Senast driftsatt", definition: item.value.lastDeployed },
          ]
        : [],
);
</script>

<template>
    <detail-page
        :loading
        :error
        :not-found="!item"
        :back-to="{ name: 'delsystem' }"
        back-label="Alla delsystem"
    >
        <template v-if="item">
            <h1>{{ item.name }}</h1>
            <p>
                Miljö:
                <f-badge :status="environmentBadge(item.environment)">{{ item.environment }}</f-badge>
            </p>
            <f-definition-list :definitions />
        </template>
    </detail-page>
</template>

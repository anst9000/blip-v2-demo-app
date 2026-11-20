<script setup lang="ts">
/**
 * Stands in for the application's page in another internal system until its
 * real address is set (VITE_INTERNT_SYSTEM_URL). It is shown without Blip's
 * header and menu, since it is meant to be a separate application.
 */
import { FMessageBox } from "@fkui/vue";
import { useResource } from "../composables/useResource";
import { applikationRepository } from "../repositories/applikationRepository";
import { INTERNT_SYSTEM_NAMN } from "../utils/internSystem";

const props = defineProps<{ id: number }>();

const {
    data: item,
    loading,
    error,
} = useResource(
    () => applikationRepository.getById(props.id),
    () => props.id,
);
</script>

<template>
    <div class="mock-system">
        <p class="mock-system__banner">
            Låtsassida som står i för en annan intern applikation. Den riktiga adressen läggs in senare.
        </p>

        <h1>{{ INTERNT_SYSTEM_NAMN }}</h1>

        <p v-if="loading">Hämtar applikationen…</p>
        <f-message-box v-else-if="error" type="error">
            <template #default="{ headingSlotClass }">
                <h2 :class="headingSlotClass">Kunde inte hämta applikationen</h2>
                <p>{{ error }}</p>
            </template>
        </f-message-box>
        <p v-else-if="!item">Det finns ingen applikation med id {{ id }}.</p>
        <dl v-else class="mock-system__facts">
            <dt>Namn</dt>
            <dd>{{ item.namn }}</dd>
            <dt>Id</dt>
            <dd>{{ item.id }}</dd>
        </dl>
    </div>
</template>

<style scoped>
.mock-system {
    max-width: 40rem;
}

.mock-system__banner {
    padding: 0.5rem 0.75rem;
    border-left: 4px solid var(--fkds-color-border-strong);
    background: color-mix(in srgb, var(--fkds-color-text-primary) 8%, var(--fkds-color-background-primary));
}

.mock-system__facts {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.5rem 1.5rem;
    font-size: 1.25rem;
}

.mock-system__facts dt {
    font-weight: bold;
}

.mock-system__facts dd {
    margin: 0;
}
</style>

<script setup lang="ts" generic="V extends string">
/**
 * A row of tabs following the WAI-ARIA tabs pattern: the tabs are buttons in a
 * tablist, the arrow keys (and Home/End) move between them, and only the chosen
 * tab is in the tab order. The page renders the panel itself, with
 * `role="tabpanel"`, `id` = `panelId(value)` and `aria-labelledby` = `tabId(value)`.
 * FKUI 6.65 has no tab component, so this one uses FKUI's colours for menus.
 */
import { useTemplateRef } from "vue";

const props = defineProps<{
    /** Name of the tab row for screen readers */
    label: string;
    /** Prefix for the ids of the tabs and panels, unique on the page */
    idPrefix: string;
    tabs: Array<{ value: V; label: string }>;
}>();

const model = defineModel<V>({ required: true });

const buttons = useTemplateRef<HTMLButtonElement[]>("buttons");

function select(index: number): void {
    model.value = props.tabs[index].value;
    buttons.value?.[index]?.focus();
}

function onKeydown(event: KeyboardEvent, index: number): void {
    const last = props.tabs.length - 1;
    const target = {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
    }[event.key];
    if (target !== undefined) {
        event.preventDefault();
        select(target);
    }
}
</script>

<template>
    <div class="tab-list" role="tablist" :aria-label="label">
        <button
            v-for="(tab, index) in tabs"
            :id="`${idPrefix}-tab-${tab.value}`"
            ref="buttons"
            :key="tab.value"
            type="button"
            role="tab"
            class="tab-list__tab"
            :aria-selected="model === tab.value"
            :aria-controls="`${idPrefix}-panel-${tab.value}`"
            :tabindex="model === tab.value ? 0 : -1"
            @click="select(index)"
            @keydown="onKeydown($event, index)"
        >
            {{ tab.label }}
        </button>
    </div>
</template>

<style scoped>
.tab-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.25rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--fkds-color-border-primary);
}

.tab-list__tab {
    margin-bottom: -1px;
    padding: 0.75rem 1rem;
    border: 0;
    border-bottom: 4px solid transparent;
    background: transparent;
    color: var(--fkds-color-text-primary);
    font: inherit;
    cursor: pointer;
}

.tab-list__tab:hover {
    border-bottom-color: var(--fkds-color-navigation-border-hover);
    background: var(--fkds-color-navigation-background-hover);
}

.tab-list__tab[aria-selected="true"] {
    border-bottom-color: var(--fkds-color-navigation-border-selected);
    font-weight: bold;
}

.tab-list__tab:focus-visible {
    outline: 3px solid var(--fkds-color-action-border-primary-focus);
    outline-offset: -3px;
}
</style>

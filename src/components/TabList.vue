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
/*
 * Folder tabs: each tab is a box of its own. The chosen tab has a thick
 * coloured top edge and the page background, and covers the line under the
 * row so it joins the content below. The other tabs are shaded and a bit
 * lower, with link-coloured text to show they can be clicked.
 */
.tab-list {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0 0.375rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--fkds-color-border-strong);
}

.tab-list__tab {
    position: relative;
    margin-bottom: -2px;
    padding: 0.625rem 1.25rem;
    border: 1px solid var(--fkds-color-border-primary);
    border-bottom: 2px solid var(--fkds-color-border-strong);
    border-radius: 0.375rem 0.375rem 0 0;
    /* A shade of the text colour, so the tab is greyer than the page in both light and dark theme */
    background: color-mix(in srgb, var(--fkds-color-text-primary) 9%, var(--fkds-color-background-primary));
    color: var(--fkds-color-action-text-primary-default);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
}

.tab-list__tab:hover {
    background: color-mix(in srgb, var(--fkds-color-text-primary) 18%, var(--fkds-color-background-primary));
    color: var(--fkds-color-action-text-primary-hover);
}

.tab-list__tab[aria-selected="true"] {
    z-index: 1;
    padding-top: 0.875rem;
    border-color: var(--fkds-color-border-strong);
    /* The menu's green, pulled towards the text colour: darker in light theme, brighter in dark */
    border-top: 5px solid color-mix(in srgb, var(--fkds-color-navigation-border-selected) 65%, var(--fkds-color-text-primary));
    border-bottom-color: var(--fkds-color-background-primary);
    background: var(--fkds-color-background-primary);
    color: var(--fkds-color-text-primary);
    font-weight: bold;
    text-decoration: none;
    cursor: default;
}

.tab-list__tab:focus-visible {
    outline: 3px solid var(--fkds-color-action-border-primary-focus);
    outline-offset: 2px;
}
</style>

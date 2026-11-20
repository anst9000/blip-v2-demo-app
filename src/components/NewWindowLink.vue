<script setup lang="ts">
/**
 * A link shown as FKUI's "new window" icon that opens in a new tab or window.
 * The text is read by screen readers and shown as a tooltip. The
 * `data-new-window` attribute tells useRowLink not to treat it as the row's link.
 */
import { FIcon } from "@fkui/vue";

/* FTable passes the row to a rendered cell as an attribute; it should not end up on the link */
defineOptions({ inheritAttrs: false });

defineProps<{
    href: string;
    /** What the link opens, e.g. "Öppna ABC_SUP_REGLER i Internt system" */
    label: string;
}>();
</script>

<template>
    <!-- The wrapper centres the icon in the cell; only the icon itself is the link -->
    <span class="new-window-link__cell">
        <a
            :href
            class="new-window-link"
            data-new-window
            target="_blank"
            rel="noopener"
            :title="`${label} (nytt fönster)`"
        >
            <f-icon name="new-window" class="new-window-link__icon" />
            <span class="sr-only">{{ label }} (öppnas i nytt fönster)</span>
        </a>
    </span>
</template>

<style scoped>
.new-window-link__cell {
    display: flex;
    justify-content: center;
}

.new-window-link {
    display: inline-flex;
    padding: 0.25rem;
    color: var(--fkds-color-action-text-primary-default);
}

.new-window-link:hover {
    color: var(--fkds-color-action-text-primary-hover);
}

.new-window-link__icon {
    width: 1.5rem;
    height: 1.5rem;
}
</style>

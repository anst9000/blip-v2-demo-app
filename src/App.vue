<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { FNavigationMenu, FOffline, FPageHeader, type NavigationMenuItem } from "@fkui/vue";
import { theme, type ThemeChoice } from "./theme";

const themeOptions: { value: ThemeChoice; label: string }[] = [
    { value: "light", label: "Ljust" },
    { value: "dark", label: "Mörkt" },
    { value: "auto", label: "Auto" },
];

const route = useRoute();
const router = useRouter();

const menuItems: NavigationMenuItem[] = [
    { label: "Start", route: "start" },
    { label: "Applikationer", route: "applikationer" },
    { label: "Leveranser", route: "leveranser" },
    { label: "Delsystem", route: "delsystem" },
];

const selectedSection = computed(() => route.meta.section ?? "");

function onSelectedRoute(name: string): void {
    if (name === route.name) {
        return;
    }
    void router.push({ name });
}
</script>

<template>
    <!-- Shown at the top of the page when the browser loses its connection -->
    <f-offline />

    <f-page-header skip-link="main-content">
        <router-link to="/" class="app-name">Blip v2-demo</router-link>
        <template #skip-link-text>Hoppa till huvudinnehåll</template>
        <template #right>
            <div class="theme-switch" role="group" aria-label="Tema">
                <button
                    v-for="option in themeOptions"
                    :key="option.value"
                    type="button"
                    class="theme-switch__option"
                    :aria-pressed="theme === option.value"
                    @click="theme = option.value"
                >
                    {{ option.label }}
                </button>
            </div>
        </template>
    </f-page-header>

    <nav class="app-nav" aria-label="Huvudmeny">
        <f-navigation-menu
            :routes="menuItems"
            :route="selectedSection"
            @selected-route="onSelectedRoute"
        />
    </nav>

    <main id="main-content" class="page" tabindex="-1">
        <router-view />
    </main>
</template>

<style scoped>
.app-name {
    color: inherit;
    text-decoration: none;
}

/* Sits in the page header, so it takes the header's text colour */
.theme-switch {
    display: flex;
    border: 1px solid currentcolor;
    border-radius: var(--f-border-radius-medium, 4px);
    overflow: hidden;
}

.theme-switch__option {
    padding: 0.25rem 0.75rem;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.theme-switch__option + .theme-switch__option {
    border-left: 1px solid currentcolor;
}

.theme-switch__option[aria-pressed="true"] {
    font-weight: bold;
    text-decoration: underline;
    text-underline-offset: 0.2em;
}

.theme-switch__option:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: -4px;
}

.app-nav {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1rem;
}
</style>

import { createRouter, createWebHistory } from "vue-router";

declare module "vue-router" {
    interface RouteMeta {
        /** Page title, shown in the browser tab */
        title?: string;
        /** Which navigation menu item is selected */
        section?: string;
    }
}

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "start",
            component: () => import("../views/StartView.vue"),
            meta: { title: "Start", section: "start" },
        },
        {
            path: "/applikationer",
            name: "applikationer",
            component: () => import("../views/ApplicationListView.vue"),
            meta: { title: "Applikationer", section: "applikationer" },
        },
        {
            // The grouped view is now a tab on the Applikationer page; old links still work
            path: "/applikationer/per-delsystem",
            redirect: (to) => ({ name: "applikationer", query: { ...to.query, visa: "per-delsystem" } }),
        },
        {
            path: "/applikationer/:id(\\d+)",
            name: "applikation",
            component: () => import("../views/ApplicationDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Applikation", section: "applikationer" },
        },
        {
            path: "/leveranser",
            name: "leveranser",
            component: () => import("../views/DeliveryListView.vue"),
            meta: { title: "Leveranser", section: "leveranser" },
        },
        {
            path: "/leveranser/:id(\\d+)",
            name: "leverans",
            component: () => import("../views/DeliveryDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Leverans", section: "leveranser" },
        },
        {
            path: "/delsystem",
            name: "delsystem",
            component: () => import("../views/SubsystemListView.vue"),
            meta: { title: "Delsystem", section: "delsystem" },
        },
        {
            path: "/delsystem/:id(\\d+)",
            name: "delsystem-detalj",
            component: () => import("../views/SubsystemDetailView.vue"),
            props: (route) => ({ id: Number(route.params.id) }),
            meta: { title: "Delsystem", section: "delsystem" },
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("../views/NotFoundView.vue"),
            meta: { title: "Sidan finns inte" },
        },
    ],
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition ?? { top: 0 };
    },
});

router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} – Blip v2-demo` : "Blip v2-demo";
});

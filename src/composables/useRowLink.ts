import { useRouter } from "vue-router";

/**
 * Each row has a link (anchor column) to its detail page. Put the returned
 * handler on an element around the table: clicking anywhere on a row follows
 * that row's link, and the router handles it instead of reloading the page.
 * Links marked `data-new-window` (e.g. to another system) are not the row's
 * link and are left to the browser.
 */
export function useRowLink(): (event: MouseEvent) => void {
    const router = useRouter();

    return (event) => {
        if (event.defaultPrevented || event.button !== 0) {
            return;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return; // let the browser open the link in a new tab/window
        }
        const target = event.target as HTMLElement;
        if (target.closest("button, input, select, textarea")) {
            return;
        }
        const clicked = target.closest<HTMLAnchorElement>("a[href]");
        if (clicked?.hasAttribute("data-new-window")) {
            return; // e.g. a link to another system that opens in a new window
        }
        const row = target.closest("tbody tr");
        const link = clicked ?? row?.querySelector<HTMLAnchorElement>("a[href]:not([data-new-window])");
        const href = link?.getAttribute("href");
        if (!href || !href.startsWith("/")) {
            return;
        }
        event.preventDefault();
        void router.push(href);
    };
}

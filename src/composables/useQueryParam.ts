import { computed, type WritableComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";

/**
 * One query parameter as a string, "" when it is missing. Setting it to ""
 * removes it. A change also removes `resetKeys` (e.g. the page number, so a
 * new filter starts on page 1).
 *
 * @param allowed - the values that are accepted; anything else reads as ""
 */
export function useQueryParam(
    key: string,
    allowed: readonly string[],
    resetKeys: readonly string[] = ["sida"],
): WritableComputedRef<string> {
    const route = useRoute();
    const router = useRouter();

    return computed({
        get: () => {
            const value = route.query[key];
            return typeof value === "string" && allowed.includes(value) ? value : "";
        },
        set: (value: string) => {
            const query = { ...route.query };
            for (const reset of resetKeys) {
                delete query[reset];
            }
            if (value === "") {
                delete query[key];
            } else {
                query[key] = value;
            }
            void router.replace({ query });
        },
    });
}

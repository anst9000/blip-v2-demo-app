import { computed, ref, toValue, watch, type ComputedRef, type Ref } from "vue";
import type { TableColumn } from "@fkui/vue";

export interface ColumnOption {
    id: string;
    label: string;
    /** Required columns can not be hidden (the first column names the row) */
    required: boolean;
}

export interface ColumnVisibility<T> {
    options: ComputedRef<ColumnOption[]>;
    /** Ids (headers) of the columns currently shown */
    visibleIds: Ref<string[]>;
    visibleColumns: ComputedRef<Array<TableColumn<T, keyof T>>>;
    showAll(): void;
    /** Shows the columns that are shown by default and hides the rest */
    resetToDefault(): void;
    /** True when the columns shown are the default ones */
    isDefault: ComputedRef<boolean>;
}

function columnId<T>(column: TableColumn<T, keyof T>): string {
    return toValue(column.header);
}

/** The user's choices: column id → shown. Columns not in it get their default. */
type Choices = Record<string, boolean>;

function readChoices(storageKey: string): Choices {
    try {
        const raw = localStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }
        return Object.fromEntries(
            Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"),
        );
    } catch {
        return {};
    }
}

function writeChoices(storageKey: string, choices: Choices): void {
    try {
        localStorage.setItem(storageKey, JSON.stringify(choices));
    } catch {
        /* storage blocked: the choice just isn't remembered */
    }
}

/**
 * Keeps track of which table columns are shown. Columns are shown unless
 * their id is in `defaultHidden`. The user's choices are remembered in
 * localStorage per list; a column added later gets its default. The first
 * column names the row and is always shown.
 */
export function useColumnVisibility<T>(
    columns: () => Array<TableColumn<T, keyof T>>,
    storageKey: string,
    defaultHidden: () => readonly string[] = () => [],
): ColumnVisibility<T> {
    const options = computed<ColumnOption[]>(() =>
        columns().map((column, index) => ({
            id: columnId(column),
            label: columnId(column),
            required: index === 0,
        })),
    );

    function defaultIds(): string[] {
        const hidden = defaultHidden();
        return options.value.filter((o) => o.required || !hidden.includes(o.id)).map((o) => o.id);
    }

    const stored = readChoices(storageKey);
    const defaults = defaultIds();
    const visibleIds = ref<string[]>(
        options.value.filter((o) => o.required || (stored[o.id] ?? defaults.includes(o.id))).map((o) => o.id),
    );

    watch(visibleIds, (visible) => {
        writeChoices(storageKey, Object.fromEntries(options.value.map((o) => [o.id, visible.includes(o.id)])));
    });

    const visibleColumns = computed(() =>
        columns().filter((column, index) => index === 0 || visibleIds.value.includes(columnId(column))),
    );

    function showAll(): void {
        visibleIds.value = options.value.map((o) => o.id);
    }

    function resetToDefault(): void {
        visibleIds.value = defaultIds();
    }

    const isDefault = computed(() => {
        const defaultSet = defaultIds();
        return defaultSet.length === visibleIds.value.length && defaultSet.every((id) => visibleIds.value.includes(id));
    });

    return {
        options,
        visibleIds,
        visibleColumns,
        showAll,
        resetToDefault,
        isDefault,
    };
}

/*
 * Links to the application's page in another internal system. The address is
 * set with VITE_INTERNT_SYSTEM_URL, where "{id}" is replaced by the
 * application's id. Until the real address is set, the links go to a mock
 * page in this app (MockInternalSystemView).
 */

/** Name of the other system, used in the column header and link texts */
export const INTERNT_SYSTEM_NAMN = "Internt system";

const MOCK_URL = "/mock/internt-system/applikation/{id}";

const urlMall = import.meta.env.VITE_INTERNT_SYSTEM_URL || MOCK_URL;

/** The address of the application's page in the other system */
export function internSystemUrl(id: number, mall: string = urlMall): string {
    return mall.replaceAll("{id}", encodeURIComponent(String(id)));
}

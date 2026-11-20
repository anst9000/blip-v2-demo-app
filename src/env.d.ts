interface ImportMetaEnv {
    /** Base URL of the backend API, e.g. "https://blip.example.se/api". Default: "/api" (the mock backend) */
    readonly VITE_API_URL?: string;
    /**
     * Address of an application's page in the other internal system, with "{id}"
     * where the application's id goes. Default: a mock page in this app.
     */
    readonly VITE_INTERNT_SYSTEM_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
    /** Base URL of the backend API, e.g. "https://blip.example.se/api". Default: "/api" (the mock backend) */
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

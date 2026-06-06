/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE: string;
    readonly VITE_LANGFUSE_PUBLIC_KEY: string;
    readonly VITE_LANGFUSE_HOST: string;
    readonly NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY: string;
    readonly NEXT_PUBLIC_LANGFUSE_HOST: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

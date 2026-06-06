import { LangfuseWeb } from "langfuse";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function readLangfusePublicKey(): string {
    return (
        import.meta.env.VITE_LANGFUSE_PUBLIC_KEY ??
        import.meta.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY ??
        ""
    ).trim();
}

export function readLangfuseHost(): string {
    return (
        import.meta.env.VITE_LANGFUSE_HOST ??
        import.meta.env.NEXT_PUBLIC_LANGFUSE_HOST ??
        "https://cloud.langfuse.com"
    ).trim();
}

let client: LangfuseWeb | null = null;
let cachedPublicKey = "";
let apiConfigPromise: Promise<LangfuseWeb | null> | null = null;

function createClient(publicKey: string, baseUrl: string): LangfuseWeb {
    cachedPublicKey = publicKey;
    client = new LangfuseWeb({ publicKey, baseUrl });
    return client;
}

interface LangfuseConfigDto {
    public_key?: string;
    publicKey?: string;
    host?: string;
    base_url?: string;
    baseUrl?: string;
}

async function fetchConfigFromApi(): Promise<LangfuseWeb | null> {
    try {
        const res = await fetch(`${API_BASE}/api/langfuse/config/`);
        if (!res.ok) return null;
        const data = (await res.json()) as LangfuseConfigDto;
        const publicKey = (data.public_key ?? data.publicKey ?? "").trim();
        if (!publicKey) return null;
        const baseUrl = (data.host ?? data.base_url ?? data.baseUrl ?? readLangfuseHost()).trim();
        return createClient(publicKey, baseUrl);
    } catch {
        return null;
    }
}

/**
 * Langfuse browser client — reads .env on every call (safe after dev-server restart).
 */
export async function getLangfuseWeb(): Promise<LangfuseWeb | null> {
    const publicKey = readLangfusePublicKey();
    if (publicKey) {
        if (client && cachedPublicKey === publicKey) return client;
        return createClient(publicKey, readLangfuseHost());
    }

    if (!apiConfigPromise) {
        apiConfigPromise = fetchConfigFromApi();
    }
    return apiConfigPromise;
}

export function isLangfuseConfigured(): boolean {
    return readLangfusePublicKey().length > 0;
}

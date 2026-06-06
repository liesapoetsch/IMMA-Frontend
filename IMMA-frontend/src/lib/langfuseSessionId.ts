const STORAGE_KEY = "imma-langfuse-session-id";

function generateId(): string {
    return crypto.randomUUID();
}

/** Stable client id for Langfuse session grouping (X-Langfuse-Session-Id). */
export function getLangfuseSessionId(): string {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing && /^[\w._:-]{1,200}$/.test(existing)) {
            return existing;
        }
        const id = generateId();
        localStorage.setItem(STORAGE_KEY, id);
        return id;
    } catch {
        return generateId();
    }
}

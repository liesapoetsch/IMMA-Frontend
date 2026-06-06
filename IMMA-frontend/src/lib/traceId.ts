/** Extract Langfuse trace id from a chat POST response (snake_case or camelCase). */
export function traceIdFromSession(session: Record<string, unknown>): string | undefined {
    const candidates = [
        session.langfuse_trace_id,
        session.langfuseTraceId,
        session.trace_id,
        session.traceId,
    ];
    for (const raw of candidates) {
        if (typeof raw === "string" && raw.trim()) {
            return raw.trim();
        }
    }
    return undefined;
}

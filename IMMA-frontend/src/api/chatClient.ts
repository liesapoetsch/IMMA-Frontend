import { getLangfuseSessionId } from "../lib/langfuseSessionId.ts";
import type { ChatSession, SendMessageInput } from "../types/chat.ts";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class ChatApiError extends Error {
    readonly status: number;
    readonly detail?: string;
    readonly retryAfterSeconds?: number;

    constructor(
        status: number,
        message: string,
        options?: { detail?: string; retryAfterSeconds?: number },
    ) {
        super(message);
        this.name = "ChatApiError";
        this.status = status;
        this.detail = options?.detail;
        this.retryAfterSeconds = options?.retryAfterSeconds;
    }
}

function chatHeaders(): Record<string, string> {
    return {
        "X-Langfuse-Session-Id": getLangfuseSessionId(),
    };
}

async function parseJsonBody(res: Response): Promise<unknown> {
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new ChatApiError(res.status, text || `Request failed (${res.status})`);
    }
    return res.json();
}

function errorFromResponse(status: number, body: unknown, res: Response): ChatApiError {
    const data = body as Record<string, unknown>;

    if (status === 429) {
        const retry =
            typeof data.retry_after_seconds === "number"
                ? data.retry_after_seconds
                : Number.parseInt(res.headers.get("Retry-After") ?? "", 10) || undefined;
        return new ChatApiError(
            status,
            "The assistant is busy. Please try again shortly.",
            { retryAfterSeconds: retry },
        );
    }

    if (status === 502) {
        const detail =
            typeof data.detail === "string"
                ? data.detail
                : typeof data.error === "string"
                  ? data.error
                  : undefined;
        return new ChatApiError(
            status,
            "The assistant could not respond. Please try again.",
            { detail },
        );
    }

    if (status === 400) {
        if (typeof data.message === "string") {
            return new ChatApiError(status, data.message);
        }
        const firstField = Object.values(data).find((v) => Array.isArray(v) && typeof v[0] === "string");
        if (Array.isArray(firstField) && typeof firstField[0] === "string") {
            return new ChatApiError(status, firstField[0]);
        }
    }

    if (status === 404) {
        return new ChatApiError(status, "This chat session was not found. Refresh the page to start over.");
    }

    return new ChatApiError(status, `Request failed (${status})`);
}

/**
 * Backend expects `message` as a plain string, e.g. `{ "message": "Hallo" }`.
 * If a structured value slips through, read `text` or `content`.
 */
function toPlainMessageString(raw: unknown): string {
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        if (typeof obj.text === "string") return obj.text;
        if (typeof obj.content === "string") return obj.content;
    }
    return "";
}

async function postChat(url: string, input?: SendMessageInput): Promise<ChatSession> {
    const hasImage = Boolean(input?.image);
    const message = toPlainMessageString(input?.message);
    let body: BodyInit;
    const headers: Record<string, string> = { ...chatHeaders() };

    if (hasImage) {
        const fd = new FormData();
        fd.append("message", message);
        if (input?.image) fd.append("image", input.image, input.image.name);
        body = fd;
    } else if (message.length > 0) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ message });
    } else {
        body = JSON.stringify({});
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, { method: "POST", headers, body });
    const data = await parseJsonBody(res);

    if (!res.ok) {
        throw errorFromResponse(res.status, data, res);
    }

    return data as ChatSession;
}

export function createChatSession(input?: SendMessageInput): Promise<ChatSession> {
    return postChat(`${API_BASE}/api/chat/sessions/`, input);
}

export function sendChatMessage(sessionId: string, input?: SendMessageInput): Promise<ChatSession> {
    return postChat(`${API_BASE}/api/chat/sessions/${sessionId}/`, input);
}

export function assistantText(session: ChatSession): string {
    return (
        session.assistant_message?.trim() ||
        session.messages.filter((m) => m.role === "assistant").at(-1)?.content ||
        ""
    );
}

export function markedImageUrl(session: ChatSession): string | undefined {
    const url = session.marked_image_url?.trim();
    return url || undefined;
}

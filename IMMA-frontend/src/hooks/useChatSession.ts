import { useCallback, useEffect, useRef, useState } from "react";
import {
    assistantText,
    ChatApiError,
    createChatSession,
    markedImageUrl,
    sendChatMessage,
} from "../api/chatClient.ts";
import { traceIdFromSession } from "../lib/traceId.ts";
import type { SendMessageInput } from "../types/chat.ts";

export interface ChatTurn {
    id: number;
    userMessage: string;
    userImagePreview?: string;
    assistantMessage?: string;
    assistantImageUrl?: string;
    /** Set only after a successful POST when Langfuse tracing is enabled. */
    langfuseTraceId?: string;
    feedbackSubmitted?: boolean;
    errorMessage?: string;
    errorDetail?: string;
}

export function useChatSession() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [phase, setPhase] = useState<string>("");
    const [turns, setTurns] = useState<ChatTurn[]>([]);
    const [initializing, setInitializing] = useState(true);
    const [sending, setSending] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const turnIdRef = useRef(0);

    const applySession = useCallback((session: Awaited<ReturnType<typeof createChatSession>>, turnId?: number) => {
        setSessionId(session.id);
        setPhase(session.phase ?? "");

        const assistant = assistantText(session);
        const img = markedImageUrl(session);
        const traceId = traceIdFromSession(session as unknown as Record<string, unknown>);
        if (import.meta.env.DEV) {
            console.debug("[IMMA] langfuse_trace_id:", traceId ?? "(empty)");
        }

        if (turnId !== undefined) {
            setTurns((prev) =>
                prev.map((t) =>
                    t.id === turnId
                        ? {
                              ...t,
                              assistantMessage: assistant,
                              assistantImageUrl: img,
                              langfuseTraceId: traceId,
                              errorMessage: undefined,
                              errorDetail: undefined,
                          }
                        : t,
                ),
            );
        } else {
            setTurns([
                {
                    id: 0,
                    userMessage: "",
                    assistantMessage: assistant || undefined,
                    assistantImageUrl: img,
                    langfuseTraceId: traceId,
                },
            ]);
            turnIdRef.current = 1;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const session = await createChatSession();
                if (!cancelled) applySession(session);
            } catch (err) {
                if (!cancelled) {
                    const msg =
                        err instanceof ChatApiError
                            ? err.message
                            : "Could not start a chat session. Please refresh.";
                    setInitError(msg);
                    console.error("Failed to create chat session:", err);
                }
            } finally {
                if (!cancelled) setInitializing(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [applySession]);

    const sendMessage = useCallback(
        async (input: SendMessageInput & { userImagePreview?: string }) => {
            if (!sessionId || sending) return;

            const hasContent = Boolean(input.message?.trim() || input.image);
            if (!hasContent) return;

            const turnId = turnIdRef.current++;
            const userMessage = input.message?.trim() ?? "";

            setTurns((prev) => [
                ...prev,
                {
                    id: turnId,
                    userMessage,
                    userImagePreview: input.userImagePreview,
                    assistantMessage: undefined,
                },
            ]);
            setSending(true);

            try {
                const session = await sendChatMessage(sessionId, {
                    message: userMessage || undefined,
                    image: input.image,
                });
                applySession(session, turnId);
            } catch (err) {
                const message =
                    err instanceof ChatApiError
                        ? err.message
                        : "Network error. Please try again.";
                const detail = err instanceof ChatApiError ? err.detail : undefined;

                setTurns((prev) =>
                    prev.map((t) =>
                        t.id === turnId
                            ? { ...t, errorMessage: message, errorDetail: detail }
                            : t,
                    ),
                );
                console.error("Chat request failed:", err);
            } finally {
                setSending(false);
            }
        },
        [sessionId, sending, applySession],
    );

    const markFeedbackSubmitted = useCallback((turnId: number) => {
        setTurns((prev) =>
            prev.map((t) => (t.id === turnId ? { ...t, feedbackSubmitted: true } : t)),
        );
    }, []);

    return {
        sessionId,
        phase,
        turns,
        initializing,
        sending,
        initError,
        sendMessage,
        markFeedbackSubmitted,
    };
}

import { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import {
    getLangfuseWeb,
    isLangfuseConfigured,
    readLangfusePublicKey,
} from "../lib/langfuseClient.ts";
import "./ChatFeedback.css";

interface Props {
    messageId: string;
    onSubmitted?: () => void;
}

type ViewState = "idle" | "submitting" | "thanks" | "error" | "submit-error";
type PanelMode = "negative" | "positive" | null;

export default function FeedbackButtons({ messageId, onSubmitted }: Props) {
    const [view, setView] = useState<ViewState>("idle");
    const [panel, setPanel] = useState<PanelMode>(null);
    const [selected, setSelected] = useState<1 | 0 | null>(null);
    const [comment, setComment] = useState("");
    const [langfuseReady, setLangfuseReady] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let cancelled = false;
        void getLangfuseWeb().then((lf) => {
            if (!cancelled) setLangfuseReady(lf !== null);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (panel && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [panel]);

    function langfuseConfigError(): string {
        if (readLangfusePublicKey()) {
            return "Langfuse client failed to initialize. Stop and restart `npm run dev` from the IMMA-frontend folder.";
        }
        return "Add NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY to IMMA-frontend/.env, then restart `npm run dev`.";
    }

    async function handleFeedback(value: number, feedbackComment?: string) {
        if (!messageId) {
            setView("error");
            return;
        }

        const langfuse = await getLangfuseWeb();
        if (!langfuse) {
            setLangfuseReady(false);
            setView("error");
            return;
        }
        setLangfuseReady(true);

        if (view === "submitting" || view === "thanks") return;

        setView("submitting");
        setPanel(null);

        try {
            await langfuse.score({
                traceId: messageId,
                name: "user-feedback",
                value,
                comment: feedbackComment?.trim() || undefined,
                dataType: "BOOLEAN",
            });
            setView("thanks");
            setSelected(null);
            setComment("");
            onSubmitted?.();
        } catch (err: unknown) {
            console.error("Failed to submit feedback:", err);
            setView("submit-error");
        }
    }

    function onThumbsUp() {
        setSelected(1);
        setPanel("positive");
    }

    function onThumbsDown() {
        if (!messageId) {
            setView("error");
            return;
        }
        setSelected(0);
        setPanel("negative");
    }

    function retry() {
        setView("idle");
        setSelected(null);
        setPanel(null);
        void getLangfuseWeb().then((lf) => setLangfuseReady(lf !== null));
    }

    if (view === "thanks") {
        return <p className="chat-feedback chat-feedback--thanks">Thanks for your feedback!</p>;
    }

    if (view === "error" || view === "submit-error") {
        const text =
            view === "submit-error"
                ? "Could not send feedback (check console — wrong host or invalid trace id?)."
                : !messageId
                  ? "No trace id from server — enable Langfuse on the Django backend."
                  : langfuseConfigError();

        return (
            <div className="chat-feedback-error-block">
                <p className="chat-feedback chat-feedback--error">{text}</p>
                <button type="button" className="chat-feedback__retry" onClick={retry}>
                    Try again
                </button>
            </div>
        );
    }

    const busy = view === "submitting";
    const hint = !messageId
        ? "Waiting for trace id from server…"
        : !langfuseReady && !isLangfuseConfigured()
          ? "Add Langfuse public key to .env and restart the dev server"
          : null;

    const panelCopy =
        panel === "positive"
            ? {
                  title: "Additional Feedback",
                  hint: "What was helpful about this answer? (optional)",
              }
            : {
                  title: "Additional Feedback",
                  hint: "Tell us what went wrong (optional)",
              };

    return (
        <div className="chat-feedback-block">
            <div className="chat-feedback" role="group" aria-label="Rate this answer">
                <button
                    type="button"
                    className={`chat-feedback__btn ${selected === 1 ? "is-active" : ""}`}
                    aria-label="Thumbs up"
                    disabled={busy}
                    onClick={onThumbsUp}
                >
                    <ThumbsUp size={18} />
                </button>
                <button
                    type="button"
                    className={`chat-feedback__btn chat-feedback__btn--down ${selected === 0 ? "is-active" : ""}`}
                    aria-label="Thumbs down"
                    disabled={busy}
                    onClick={onThumbsDown}
                >
                    <ThumbsDown size={18} />
                </button>
            </div>

            {panel && (
                <div
                    className="feedback-panel"
                    role="dialog"
                    aria-labelledby="feedback-panel-title"
                >
                    <div className="feedback-panel__icons">
                        <span className="feedback-panel__brand" aria-hidden>
                            ✦
                        </span>
                        <button
                            type="button"
                            className={`feedback-panel__icon-btn ${selected === 1 ? "is-active" : ""}`}
                            aria-label="Thumbs up"
                            onClick={() => {
                                setSelected(1);
                                setPanel("positive");
                            }}
                        >
                            <ThumbsUp size={18} />
                        </button>
                        <button
                            type="button"
                            className={`feedback-panel__icon-btn feedback-panel__icon-btn--down ${selected === 0 ? "is-active" : ""}`}
                            aria-label="Thumbs down"
                            aria-pressed={selected === 0}
                            onClick={() => {
                                setSelected(0);
                                setPanel("negative");
                            }}
                        >
                            <ThumbsDown size={18} />
                        </button>
                    </div>

                    <h3 id="feedback-panel-title" className="feedback-panel__title">
                        {panelCopy.title}
                    </h3>
                    <p className="feedback-panel__hint">{panelCopy.hint}</p>

                    <textarea
                        ref={textareaRef}
                        className="feedback-panel__textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder=""
                        rows={4}
                        disabled={busy}
                    />

                    <div className="feedback-panel__actions">
                        <button
                            type="button"
                            className="feedback-panel__skip"
                            disabled={busy}
                            onClick={() => {
                                const value = panel === "positive" ? 1 : 0;
                                void handleFeedback(value);
                            }}
                        >
                            Skip
                        </button>
                        <button
                            type="button"
                            className="feedback-panel__submit"
                            disabled={busy}
                            onClick={() => {
                                const value = panel === "positive" ? 1 : 0;
                                void handleFeedback(value, comment);
                            }}
                        >
                            {busy ? "Sending…" : "Submit"}
                        </button>
                    </div>
                </div>
            )}

            {hint && !panel && <p className="chat-feedback__hint">{hint}</p>}
        </div>
    );
}

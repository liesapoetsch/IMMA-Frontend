import { useState, useRef, useEffect } from "react";
import "./ChatScreen.css";
import immaProfile from "./assets/ImmaProfilePicture.png";
import FileInput from "./components/FileInput.tsx";
import FeedbackButtons from "./components/FeedbackButtons.tsx";
import { useChatSession } from "./hooks/useChatSession.ts";

export default function InputBar() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [sendMessageToggle, setSendMessageToggle] = useState(true);
    const [uploadedPreview, setUploadedPreview] = useState<string | undefined>();
    const [selectedFile, setSelectedFile] = useState<File | undefined>();

    const {
        sessionId,
        phase,
        turns,
        initializing,
        sending,
        initError,
        sendMessage,
        markFeedbackSubmitted,
    } = useChatSession();

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }, [value]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [turns, sending]);

    function handleFileChange(file: File | undefined, previewUrl?: string) {
        setSelectedFile(file);
        setUploadedPreview(previewUrl);
    }

    async function handleSendMessage() {
        if (!sessionId || sending) return;
        if (value === "" && selectedFile === undefined) return;

        const userMessage = value;
        const preview = uploadedPreview;
        const file = selectedFile;

        setValue("");
        setUploadedPreview(undefined);
        setSelectedFile(undefined);
        setSendMessageToggle((prev) => !prev);

        await sendMessage({
            message: userMessage,
            image: file,
            userImagePreview: preview,
        });
    }

    const lastTurnId = turns.at(-1)?.id;

    return (
        <div className="page">
            {phase && import.meta.env.DEV && (
                <p className="chat-phase-hint" aria-hidden>
                    Phase: {phase}
                </p>
            )}

            <div className="chatContainer" ref={containerRef}>
                {initError && (
                    <p className="chat-error-banner" role="alert">
                        {initError}
                    </p>
                )}

                {turns.map((turn) => (
                    <div className="bubbleContainer" key={turn.id}>
                        {turn.userMessage !== "" || turn.userImagePreview !== undefined ? (
                            <div className="chatRow">
                                <div className="chatBubbleUser">
                                    {turn.userImagePreview !== undefined && (
                                        <img
                                            src={turn.userImagePreview}
                                            alt="Uploaded"
                                            className="fileChat"
                                        />
                                    )}
                                    {turn.userMessage}
                                </div>
                            </div>
                        ) : null}

                        <div className="chatRow">
                            {turn.errorMessage ? (
                                <div className="chatBubbleKI chatBubbleKI--error">
                                    <img src={immaProfile} alt="IMMA" className="profilePicture" />
                                    <div className="column">
                                        <p>{turn.errorMessage}</p>
                                        {import.meta.env.DEV && turn.errorDetail && (
                                            <p className="chat-error-detail">{turn.errorDetail}</p>
                                        )}
                                    </div>
                                </div>
                            ) : turn.assistantMessage === undefined ? (
                                sending && turn.id === lastTurnId ? (
                                    <div className="chatBubbleKI">
                                        <img src={immaProfile} alt="IMMA" className="profilePicture" />
                                        <div className="column">...</div>
                                    </div>
                                ) : null
                            ) : turn.assistantMessage === "" ? null : (
                                <div className="assistantBlock">
                                    <div className="chatBubbleKI">
                                        <img src={immaProfile} alt="IMMA" className="profilePicture" />
                                        <div className="column">
                                            {turn.assistantMessage}
                                            {turn.assistantImageUrl !== undefined && (
                                                <img
                                                    src={turn.assistantImageUrl}
                                                    alt="Marked assembly"
                                                    className="botimage"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {!turn.feedbackSubmitted && (
                                        <FeedbackButtons
                                            messageId={turn.langfuseTraceId ?? ""}
                                            onSubmitted={() => markFeedbackSubmitted(turn.id)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="inputRow">
                <div className="input-bar">
                    <FileInput onFileChange={handleFileChange} uploaded={sendMessageToggle} />

                    <textarea
                        ref={textareaRef}
                        className="textarea"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Submit your request here..."
                        rows={1}
                        disabled={!sessionId || sending || initializing}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void handleSendMessage();
                            }
                        }}
                    />

                    <button className="btn btn-mic" type="button" aria-label="Spracheingabe">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-6 10a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.938V21h2v2H9v-2h2v-2.062A8 8 0 0 1 4 11H6z" />
                        </svg>
                    </button>
                </div>

                <button
                    className="btn-send"
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!sessionId || sending || initializing}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M10 14l11 -11" />
                        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

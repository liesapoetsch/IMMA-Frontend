import { useState, useRef, useEffect } from "react";
import "./ChatScreen.css";

export default function InputBar() {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }, [value]);

    return (
        <div className="page">
            <div className="input-bar">
                {/* Plus Button */}
                <button className="btn btn-plus" aria-label="Hinzufügen">
                    +
                </button>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    className="textarea"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Submit your request here..."
                    rows={1}
                />

                {/* Microphone Button */}
                <button className="btn btn-mic" aria-label="Spracheingabe">
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
        </div>
    );
}

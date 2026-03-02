import { useState } from "react";

export default function GameTest() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>("");

    async function send() {
        if (!file) return;

        const fd = new FormData();
        fd.append("image", file); // <-- muss "image" heißen wie in der View

        const res = await fetch("http://localhost:8000/text_output/", {
            method: "POST",
            body: fd,
        });

        const data = await res.json();
        setText(data.gemini_text ?? JSON.stringify(data, null, 2));
    }

    return (
        <div style={{ padding: 16 }}>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button onClick={send} style={{ marginLeft: 8 }}>
                Send to Backend
            </button>

            <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {text}
      </pre>
        </div>
    );
}
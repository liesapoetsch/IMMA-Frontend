import {useState, useRef, useEffect} from "react";
import "./FileInput.css"

interface Props {
    onFileChange: (file: File | undefined, previewUrl?: string) => void;
    uploaded: boolean;
}
export default function FileInput({onFileChange, uploaded}: Props) {
    const [previewUrl, setPreviewUrl] = useState<string>();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(undefined);
        onFileChange(undefined);
        if (inputRef.current) inputRef.current.value = "";
    }, [uploaded]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onFileChange(file, url);
        }
    }

    return (
        <div className="file-input-container">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                hidden
            />

            {previewUrl ? (
                <div className="preview-wrapper">
                    <img src={previewUrl} alt="Preview" className="preview-img" />
                    <button
                        className="remove-btn"
                        onClick={() => {
                            setPreviewUrl(undefined);
                            onFileChange(undefined);
                        }}
                    >✕</button>
                </div>
            ) : (
                <button
                    className="plus-btn"
                    onClick={() => inputRef.current?.click()}
                    title="Bild hinzufügen"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            )}


        </div>
    );
}
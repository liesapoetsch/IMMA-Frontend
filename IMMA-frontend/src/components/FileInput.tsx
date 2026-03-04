import {useState, useRef, useEffect} from "react";
import "./FileInput.css"

interface Props {
    onFileChange: (file:string | undefined) => void;
    uploaded: boolean;
}
export default function FileInput({onFileChange, uploaded}: Props) {
    const [uploadedFile, setUploadedFile] = useState<string>();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUploadedFile(undefined);
        onFileChange(undefined)
        if (inputRef.current) inputRef.current.value = "";
    },[uploaded])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files?.[0]) {
            const fileUrl = URL.createObjectURL(e.target.files[0]);
            setUploadedFile(fileUrl);
            onFileChange(fileUrl);
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

            {uploadedFile ? (
                <div className="preview-wrapper">
                    <img src={uploadedFile} alt="Preview" className="preview-img" />
                    <button
                        className="remove-btn"
                        onClick={() => setUploadedFile(undefined)}
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
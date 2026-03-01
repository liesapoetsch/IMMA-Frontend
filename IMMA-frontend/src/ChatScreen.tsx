import { useState, useRef, useEffect } from "react";
import "./ChatScreen.css";
import immaProfile from "./assets/ImmaProfilePicture.png"

interface chatHistory {
    id: number;
    message: string;
    answer: string;
    img : string | null; // für Image Pfad maybe
    imgAnswer : string | null;
    //date?
}

export default function InputBar() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [sendMessage, setSendMessage] = useState<boolean>(true);
    const [chatHistory, setChatHistory] = useState<chatHistory[]>([{id:0,message:"Hello", answer:"Hello, Im Imma , how can i help you ?",img: null, imgAnswer:null}]);

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
    }, [chatHistory]);

    function handleSendMessage() {
        if(value !== ""){
            setSendMessage(!sendMessage);
            setChatHistory(prev => [...prev, {
                id: prev.length,
                message: value,
                answer: "",
                img: null,
                imgAnswer: null
            }]);
            setValue("");
        }
    }

    return (
        <div className="page">
           <div className="chatContainer" ref={containerRef}>
               {chatHistory.map((chat: chatHistory) => (
                   <div className={"bubbleContainer"} key={chat.id}>
                   <div className="chatRow">
                   <div className={"chatBubbleUser"}>
                       {chat.message}
                   </div>
                   </div>
                   <div className="chatRow">
                       {chat.answer === "" ? "" :
                           <div className={"chatBubbleKI"}>
                               <img src={immaProfile} alt="IMMA" className = "profilePicture" />
                            {chat.answer}
                           </div>
                       }
                </div>
                   </div>

               ))}
           </div>
            <div className = "inputRow">
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
            <button
                className="btn-send"
                onClick={() => handleSendMessage()}>
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

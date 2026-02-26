import App from "./App.tsx";

function ChatScreen(){
    const textInput = "Hallo"

    return (
        <>
            <App></App>
            <input type={"text"} name={"TextInput"} value={textInput}/>
        </>
)
}

export default ChatScreen
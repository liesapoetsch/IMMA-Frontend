import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatScreen from "./ChatScreen.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatScreen/>
  </StrictMode>,
)

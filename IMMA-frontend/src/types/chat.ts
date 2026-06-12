export type ChatRole = "user" | "assistant";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    phase: string;
    assistant_message: string;
    parts_inventory: string[];
    assembly_step: number;
    marked_image_url: string;
    langfuse_trace_id: string;
    created_at: string;
    updated_at: string;
}

/** User text — always sent to the API as a plain JSON string field `message`. */
export interface SendMessageInput {
    message?: string;
    image?: File;
}

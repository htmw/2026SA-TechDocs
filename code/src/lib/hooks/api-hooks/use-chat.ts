// code/src/lib/hooks/api-hooks/use-chat.ts

import { useState } from "react";

export type ChatDeleteMode =
    | "all"
    | "message"
    | "last_4_hours"
    | "today"
    | "last_7_days"
    | "last_30_days";

export interface ChatMessage {
    id?: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadHistory() {
        setErrorMessage("");
        setIsHistoryLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "GET",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat history failed to load.");
            }

            // Loads saved chat messages.
            setMessages(data.messages || []);
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat history failed to load.";

            setErrorMessage(message);
        }
        finally {
            setIsHistoryLoading(false);
        }
    }

    async function deleteHistory(deleteMode: ChatDeleteMode, messageId?: string) {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },

                // Sends selected delete option.
                body: JSON.stringify({
                    deleteMode,
                    messageId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat history failed to delete.");
            }

            // Reloads remaining chat messages.
            await loadHistory();
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat history failed to delete.";

            setErrorMessage(message);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function sendMessage(message: string) {
        const cleanMessage = message.trim();

        if (!cleanMessage) {
            return;
        }

        setErrorMessage("");

        // Shows user message immediately.
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                role: "user",
                content: cleanMessage,
            },
        ]);

        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                // Sends typed message.
                body: JSON.stringify({
                    message: cleanMessage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat failed.");
            }

            // Adds chatbot reply.
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: "assistant",
                    content: data.reply,
                },
            ]);
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat failed.";

            setErrorMessage(message);
        }
        finally {
            setIsLoading(false);
        }
    }

    return {
        messages,
        isLoading,
        isHistoryLoading,
        errorMessage,
        loadHistory,
        deleteHistory,
        sendMessage,
    };
}
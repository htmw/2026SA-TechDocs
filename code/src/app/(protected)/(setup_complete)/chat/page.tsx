// code/src/app/(protected)/(setup_complete)/chat/page.tsx

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useChat } from "@/lib/hooks/api-hooks/use-chat";

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const {
        messages,
        isLoading,
        isHistoryLoading,
        errorMessage,
        loadHistory,
        deleteHistory,
        sendMessage,
    } = useChat();

    // Loads saved chat history.
    useEffect(() => {
        loadHistory();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Sends the typed message.
        await sendMessage(message);
        setMessage("");
    }

    async function handleDeleteMessage(messageId?: string) {
        if (!messageId) {
            return;
        }

        const confirmed = window.confirm("Delete this message?");

        if (!confirmed) {
            return;
        }

        // Deletes one saved message.
        await deleteHistory("message", messageId);
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
            <section>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Ask NutriAI</h1>
                        <p className="mt-2 text-gray-600">
                            Ask questions about your plan, diet, progress, meals, energy, sleep, and habits.
                        </p>
                    </div>

                    {/* Opens chat management pages. */}
                    <div className="flex shrink-0 gap-2">
                        <Link
                            className="whitespace-nowrap rounded-lg border px-4 py-2 text-sm"
                            href="/chat/history"
                        >
                            Manage History
                        </Link>

                        <Link
                            className="whitespace-nowrap rounded-lg border px-4 py-2 text-sm"
                            href="/chat/rules"
                        >
                            Manage Rules
                        </Link>
                    </div>
                </div>
            </section>

            <section className="flex h-[60vh] flex-col rounded-xl border bg-white p-4 shadow-sm">
                {/* Shows saved and new messages. */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                    {isHistoryLoading && (
                        <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                            Loading chat history...
                        </div>
                    )}

                    {!isHistoryLoading && messages.length === 0 && (
                        <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                            Try asking: “How am I doing this week?” or “What should I focus on today?”
                        </div>
                    )}

                    {messages.map((chatMessage, index) => (
                        <div
                            key={chatMessage.id || `${chatMessage.role}-${index}`}
                            className={
                                chatMessage.role === "user"
                                    ? "group flex max-w-[85%] flex-col gap-1 self-end rounded-lg bg-black px-4 py-2 text-white"
                                    : "group flex max-w-[85%] flex-col gap-1 self-start rounded-lg bg-gray-100 px-4 py-2 text-gray-900"
                            }
                        >
                            <p>{chatMessage.content}</p>

                            {chatMessage.id && (
                                <button
                                    className={
                                        chatMessage.role === "user"
                                            ? "self-end text-xs text-gray-300 underline disabled:opacity-50"
                                            : "self-end text-xs text-gray-600 underline disabled:opacity-50"
                                    }
                                    disabled={isLoading}
                                    type="button"
                                    onClick={() => handleDeleteMessage(chatMessage.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="self-start rounded-lg bg-gray-100 px-4 py-2 text-gray-600">
                            Thinking...
                        </div>
                    )}
                </div>

                {errorMessage && (
                    <p className="mt-4 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {/* Sends new chat messages. */}
                <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
                    <input
                        className="flex-1 rounded-lg border bg-white px-4 py-2 text-black"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Ask NutriAI something..."
                    />

                    <button
                        className="whitespace-nowrap rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                        disabled={isLoading || !message.trim()}
                        type="submit"
                    >
                        Send
                    </button>
                </form>
            </section>
        </main>
    );
}
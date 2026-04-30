// code/src/app/(protected)/(setup_complete)/chat/history/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChatDeleteMode, useChat } from "@/lib/hooks/api-hooks/use-chat";

export default function ChatHistoryPage() {
    const [deleteMode, setDeleteMode] = useState<ChatDeleteMode>("all");
    const {
        messages,
        isLoading,
        isHistoryLoading,
        errorMessage,
        loadHistory,
        deleteHistory,
    } = useChat();

    // Loads saved chat history.
    useEffect(() => {
        loadHistory();
    }, []);

    async function handleDeleteByFilter() {
        const confirmed = window.confirm("Delete the selected chat history?");

        if (!confirmed) {
            return;
        }

        // Deletes selected history range.
        await deleteHistory(deleteMode);
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
                        <h1 className="text-3xl font-bold">Chat History</h1>
                        <p className="mt-2 text-gray-600">
                            View and manage your saved Ask NutriAI messages.
                        </p>
                    </div>

                    {/* Opens chat and rules pages. */}
                    <div className="flex gap-2">
                        <Link
                            className="whitespace-nowrap rounded-lg border px-4 py-2 text-sm"
                            href="/chat"
                        >
                            Back to Chat
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

            <section className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Delete Chat History</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Choose what you want to delete. This only affects your saved messages.
                    </p>
                </div>

                {/* Selects history delete range. */}
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <select
                        className="rounded-lg border bg-white px-4 py-2 text-black"
                        value={deleteMode}
                        onChange={(event) => setDeleteMode(event.target.value as ChatDeleteMode)}
                    >
                        <option value="all">All history</option>
                        <option value="last_4_hours">Last 4 hours</option>
                        <option value="today">Today</option>
                        <option value="last_7_days">Last 7 days</option>
                        <option value="last_30_days">Last 30 days</option>
                    </select>

                    <button
                        className="whitespace-nowrap rounded-lg border border-red-600 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                        disabled={isLoading || isHistoryLoading || messages.length === 0}
                        type="button"
                        onClick={handleDeleteByFilter}
                    >
                        Delete Selected
                    </button>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                    Saved messages: {messages.length}
                </p>

                {errorMessage && (
                    <p className="mb-4 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {isHistoryLoading && (
                    <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                        Loading chat history...
                    </div>
                )}

                {!isHistoryLoading && messages.length === 0 && (
                    <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                        No saved chat history yet.
                    </div>
                )}

                {!isHistoryLoading && messages.length > 0 && (
                    <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto">
                        {messages.map((chatMessage, index) => (
                            <div
                                key={chatMessage.id || `${chatMessage.role}-${index}`}
                                className={
                                    chatMessage.role === "user"
                                        ? "rounded-lg border bg-gray-50 p-3"
                                        : "rounded-lg border bg-white p-3"
                                }
                            >
                                <div className="mb-2 flex items-start justify-between gap-4">
                                    <p className="text-xs font-semibold uppercase text-gray-500">
                                        {chatMessage.role === "user" ? "You" : "Ask NutriAI"}
                                    </p>

                                    <button
                                        className="whitespace-nowrap text-xs text-red-600 disabled:opacity-50"
                                        disabled={isLoading}
                                        type="button"
                                        onClick={() => handleDeleteMessage(chatMessage.id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <p className="text-sm text-gray-900">
                                    {chatMessage.content}
                                </p>

                                {chatMessage.createdAt && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {new Date(chatMessage.createdAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
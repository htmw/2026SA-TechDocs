// code/src/app/(protected)/(setup_complete)/chat/rules/page.tsx

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useChatRules } from "@/lib/hooks/api-hooks/use-chat-rules";

export default function ChatRulesPage() {
    const [newRule, setNewRule] = useState("");
    const {
        rules,
        isLoadingRules,
        ruleErrorMessage,
        loadRules,
        addRule,
        deleteRule,
    } = useChatRules();

    // Loads saved chat rules.
    useEffect(() => {
        loadRules();
    }, []);

    async function handleAddRule(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Adds new rule.
        await addRule(newRule);
        setNewRule("");
    }

    async function handleDeleteRule(ruleId: string) {
        const confirmed = window.confirm("Delete this chat rule?");

        if (!confirmed) {
            return;
        }

        // Deletes selected rule.
        await deleteRule(ruleId);
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
            <section>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Chat Rules</h1>
                        <p className="mt-2 text-gray-600">
                            Add personal rules for Ask NutriAI to follow during chat.
                        </p>
                    </div>

                    {/* Opens chat and history pages. */}
                    <div className="flex gap-2">
                        <Link
                            className="whitespace-nowrap rounded-lg border px-4 py-2 text-sm"
                            href="/chat"
                        >
                            Back to Chat
                        </Link>

                        <Link
                            className="whitespace-nowrap rounded-lg border px-4 py-2 text-sm"
                            href="/chat/history"
                        >
                            Manage History
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Add Rule</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Rules help personalize answers. Safety rules still come first.
                    </p>
                </div>

                {/* Adds new rule. */}
                <form className="mb-4 flex gap-2" onSubmit={handleAddRule}>
                    <input
                        className="flex-1 rounded-lg border bg-white px-4 py-2 text-black"
                        maxLength={500}
                        value={newRule}
                        onChange={(event) => setNewRule(event.target.value)}
                        placeholder="Example: Do not suggest seafood."
                    />

                    <button
                        className="whitespace-nowrap rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                        disabled={isLoadingRules || !newRule.trim()}
                        type="submit"
                    >
                        Add Rule
                    </button>
                </form>

                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    Good examples: “Keep answers short.” “Do not suggest seafood.” “Give budget friendly meal ideas.”
                </div>
            </section>

            <section className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Saved Rules</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        These rules are used with your profile when Ask NutriAI creates responses.
                    </p>
                </div>

                {ruleErrorMessage && (
                    <p className="mb-4 text-sm text-red-600">
                        {ruleErrorMessage}
                    </p>
                )}

                {isLoadingRules && (
                    <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                        Loading chat rules...
                    </div>
                )}

                {!isLoadingRules && rules.length === 0 && (
                    <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                        No custom chat rules yet.
                    </div>
                )}

                {!isLoadingRules && rules.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-3"
                            >
                                <div>
                                    <p className="text-sm text-gray-900">
                                        {rule.rule}
                                    </p>

                                    {rule.createdAt && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Added {new Date(rule.createdAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <button
                                    className="whitespace-nowrap rounded-lg border border-red-600 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
                                    disabled={isLoadingRules}
                                    type="button"
                                    onClick={() => handleDeleteRule(rule.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
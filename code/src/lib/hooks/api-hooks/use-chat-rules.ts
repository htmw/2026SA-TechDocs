// code/src/lib/hooks/api-hooks/use-chat-rules.ts

import { useState } from "react";

export interface ChatRule {
    id: string;
    rule: string;
    createdAt?: string;
}

export function useChatRules() {
    const [rules, setRules] = useState<ChatRule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);
    const [ruleErrorMessage, setRuleErrorMessage] = useState("");

    async function loadRules() {
        setRuleErrorMessage("");
        setIsLoadingRules(true);

        try {
            const response = await fetch("/api/chat/rules", {
                method: "GET",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat rules failed to load.");
            }

            // Loads saved chat rules.
            setRules(data.rules || []);
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat rules failed to load.";

            setRuleErrorMessage(message);
        }
        finally {
            setIsLoadingRules(false);
        }
    }

    async function addRule(rule: string) {
        const cleanRule = rule.trim();

        if (!cleanRule) {
            return;
        }

        setRuleErrorMessage("");
        setIsLoadingRules(true);

        try {
            const response = await fetch("/api/chat/rules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rule: cleanRule,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat rule failed to save.");
            }

            // Adds the saved rule.
            setRules((currentRules) => [
                ...currentRules,
                data.rule,
            ]);
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat rule failed to save.";

            setRuleErrorMessage(message);
        }
        finally {
            setIsLoadingRules(false);
        }
    }

    async function deleteRule(ruleId: string) {
        setRuleErrorMessage("");
        setIsLoadingRules(true);

        try {
            const response = await fetch("/api/chat/rules", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ruleId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat rule failed to delete.");
            }

            // Removes the deleted rule.
            setRules((currentRules) =>
                currentRules.filter((rule) => rule.id !== ruleId)
            );
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : "Chat rule failed to delete.";

            setRuleErrorMessage(message);
        }
        finally {
            setIsLoadingRules(false);
        }
    }

    return {
        rules,
        isLoadingRules,
        ruleErrorMessage,
        loadRules,
        addRule,
        deleteRule,
    };
}
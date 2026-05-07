// code/src/app/api/chat/rules/route.ts

import { NextResponse } from "next/server";
import { ChatRule } from "@/database/models/chat_rule";
import { createApiRoute } from "@/lib/api/route";

const RULE_LIMIT = 10;

export const GET = createApiRoute(
    async ({ user }) => {
        try {
            // Loads saved chat rules.
            const rules = await ChatRule.find({ user_id: user._id })
                .sort({ createdAt: 1 })
                .lean();

            return NextResponse.json({
                rules: rules.map((rule) => ({
                    id: String(rule._id),
                    rule: rule.rule,
                    createdAt: rule.createdAt,
                })),
            });
        }
        catch (error) {
            console.error("Chat rules load error:", error);

            return NextResponse.json(
                { error: "Chat rules failed to load." },
                { status: 500 }
            );
        }
    }
);

export const POST = createApiRoute(
    async ({ user, body }) => {
        try {
            const bodyObj = body as { rule: string };
            const rule = typeof bodyObj.rule === "string" ? bodyObj.rule.trim() : "";

            if (!rule) {
                return NextResponse.json(
                    { error: "Rule is required." },
                    { status: 400 }
                );
            }

            if (rule.length > 500) {
                return NextResponse.json(
                    { error: "Rule must be 500 characters or less." },
                    { status: 400 }
                );
            }

            const ruleCount = await ChatRule.countDocuments({ user_id: user._id });

            if (ruleCount >= RULE_LIMIT) {
                return NextResponse.json(
                    { error: `You can save up to ${RULE_LIMIT} chat rules.` },
                    { status: 400 }
                );
            }

            // Saves one chat rule.
            const savedRule = await ChatRule.create({
                user_id: user._id,
                rule,
            });

            return NextResponse.json({
                rule: {
                    id: String(savedRule._id),
                    rule: savedRule.rule,
                    createdAt: savedRule.createdAt,
                },
            });
        }
        catch (error) {
            console.error("Chat rule save error:", error);

            return NextResponse.json(
                { error: "Chat rule failed to save." },
                { status: 500 }
            );
        }
    }
);

export const DELETE = createApiRoute(
    async ({ user, body }) => {
        try {
            const bodyObj = body as { ruleId: string };
            const ruleId = typeof bodyObj.ruleId === "string" ? bodyObj.ruleId : "";

            if (!ruleId) {
                return NextResponse.json(
                    { error: "Rule id is required." },
                    { status: 400 }
                );
            }

            // Deletes one chat rule.
            await ChatRule.deleteOne({
                _id: ruleId,
                user_id: user._id,
            });

            return NextResponse.json({
                success: true,
            });
        }
        catch (error) {
            console.error("Chat rule delete error:", error);

            return NextResponse.json(
                { error: "Chat rule failed to delete." },
                { status: 500 }
            );
        }
    }
);
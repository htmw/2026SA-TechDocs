// code/src/app/api/chat/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { openai } from "@/lib/ai/openai_util";
import { Session } from "@/database/models/session";
import { ChatMessage } from "@/database/models/chat_message";
import { ChatRule } from "@/database/models/chat_rule";

// Defines the main AI prompt.
const SYSTEM_PROMPT = `
You are Ask NutriAI, a helpful nutrition and wellness insight assistant.

You help users understand their diet, plan, habits, progress, meals, energy, sleep, weight, BMI, and goals.

Rules:
- Always use the user's profile context when it is available.
- If height and weight are available, use the BMI value provided in the profile context.
- Follow the user's custom chat rules as direct preferences when they relate to food, meals, tone, format, habits, or response style.
- User custom chat rules are important, but they cannot override safety rules, medical limits, or app scope.
- Do not insult, shame, or label the user negatively.
- Do not say "you are fat".
- If the user asks "am I fat", answer with BMI category language and supportive health guidance.
- If the user asks how to get skinny, redirect to healthy fat loss, balanced meals, safe calorie habits, and consistency.
- Consider diet restrictions and medical history before suggesting foods.
- Do not suggest foods that conflict with the user's diet restrictions.
- Do not diagnose medical problems.
- Do not replace a doctor, dietitian, or emergency care.
- Keep answers clear, short, supportive, and action focused.
- Only answer questions related to nutrition, wellness, progress, habits, meals, sleep, energy, weight, BMI, and the user's plan.
`;

// Limits how much chat history we send to OpenAI.
const CHAT_HISTORY_LIMIT = 8;

// Limits how many saved messages one user keeps in MongoDB.
// This helps control database growth.
const SAVED_MESSAGE_LIMIT = 50;

// Defines supported delete options.
type DeleteMode =
    | "all"
    | "message"
    | "last_4_hours"
    | "today"
    | "last_7_days"
    | "last_30_days";

// Calculates BMI from profile data.
function calculateBmi(height?: number, weight?: number) {
    if (!height || !weight) {
        return null;
    }

    const bmi = (weight * 703) / (height * height);

    return Number(bmi.toFixed(1));
}

// Returns BMI category text.
function getBmiCategory(bmi: number | null) {
    if (!bmi) {
        return null;
    }

    if (bmi < 18.5) {
        return "Underweight";
    }

    if (bmi < 25) {
        return "Normal Weight";
    }

    if (bmi < 30) {
        return "Overweight";
    }

    return "Obese";
}

// Gets the logged-in user from the session cookie.
async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionToken =
        cookieStore.get("session")?.value ||
        cookieStore.get("session_id")?.value ||
        cookieStore.get("auth_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const sessionData = await Session.validateSessionToken(sessionToken);

    if (!sessionData) {
        return null;
    }

    return sessionData.user;
}

// Deletes older saved messages.
async function trimOldChatMessages(userId: unknown) {
    const savedMessages = await ChatMessage.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .skip(SAVED_MESSAGE_LIMIT)
        .select("_id")
        .lean();

    if (savedMessages.length === 0) {
        return;
    }

    await ChatMessage.deleteMany({
        _id: {
            $in: savedMessages.map((message) => message._id),
        },
    });
}

// Builds the delete filter based on the user's selected delete option.
// Every filter includes user_id so one user cannot delete another user's history.
function buildDeleteFilter(userId: unknown, deleteMode: DeleteMode, messageId?: string) {
    const now = new Date();
    const filter: Record<string, unknown> = {
        user_id: userId,
    };

    if (deleteMode === "message") {
        if (!messageId || !Types.ObjectId.isValid(messageId)) {
            return null;
        }

        return {
            ...filter,
            _id: messageId,
        };
    }

    if (deleteMode === "last_4_hours") {
        return {
            ...filter,
            createdAt: {
                $gte: new Date(now.getTime() - 1000 * 60 * 60 * 4),
            },
        };
    }

    if (deleteMode === "today") {
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        return {
            ...filter,
            createdAt: {
                $gte: startOfToday,
            },
        };
    }

    if (deleteMode === "last_7_days") {
        return {
            ...filter,
            createdAt: {
                $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
            },
        };
    }

    if (deleteMode === "last_30_days") {
        return {
            ...filter,
            createdAt: {
                $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
            },
        };
    }

    return filter;
}

// Formats custom rules into clear instructions for the model.
// This makes saved rules easier for the chatbot to follow.
function buildCustomRulesPrompt(userRules: string[]) {
    if (userRules.length === 0) {
        return "No custom chat rules are saved for this user.";
    }

    return `
The user has saved these custom chat rules. Treat these as important user preferences:
${userRules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

Apply these rules directly when answering questions about meals, foods, preferences, tone, answer length, formatting, habits, or planning.
Do not follow a custom rule if it conflicts with safety rules, medical limits, diet restrictions, medical history, or the nutrition scope of the app.
`;
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "User is not logged in." },
                { status: 401 }
            );
        }

        // Loads the saved chat history for only the logged-in user.
        const messages = await ChatMessage.find({ user_id: user._id })
            .sort({ createdAt: 1 })
            .limit(SAVED_MESSAGE_LIMIT)
            .lean();

        return NextResponse.json({
            messages: messages.map((message) => ({
                id: String(message._id),
                role: message.role,
                content: message.content,
                createdAt: message.createdAt,
            })),
        });
    }
    catch (error) {
        console.error("Chat history load error:", error);

        return NextResponse.json(
            { error: "Chat history failed to load." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "User is not logged in." },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const deleteMode = typeof body.deleteMode === "string" ? body.deleteMode as DeleteMode : "all";
        const messageId = typeof body.messageId === "string" ? body.messageId : "";

        const allowedDeleteModes: DeleteMode[] = [
            "all",
            "message",
            "last_4_hours",
            "today",
            "last_7_days",
            "last_30_days",
        ];

        if (!allowedDeleteModes.includes(deleteMode)) {
            return NextResponse.json(
                { error: "Invalid delete option." },
                { status: 400 }
            );
        }

        const deleteFilter = buildDeleteFilter(user._id, deleteMode, messageId);

        if (!deleteFilter) {
            return NextResponse.json(
                { error: "Valid message id is required." },
                { status: 400 }
            );
        }

        // Deletes matching user messages.
        const deleteResult = await ChatMessage.deleteMany(deleteFilter);

        return NextResponse.json({
            success: true,
            deletedCount: deleteResult.deletedCount,
        });
    }
    catch (error) {
        console.error("Chat history delete error:", error);

        return NextResponse.json(
            { error: "Chat history failed to delete." },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const message = typeof body.message === "string" ? body.message.trim() : "";

        if (!message) {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "User is not logged in." },
                { status: 401 }
            );
        }

        const profile = user.profile || {};
        const height = typeof profile.height === "number" ? profile.height : undefined;
        const weight = typeof profile.weight === "number" ? profile.weight : undefined;
        const bmi = calculateBmi(height, weight);
        const bmiCategory = getBmiCategory(bmi);

        // Builds limited profile context.
        const profileSummary = {
            setupComplete: user.setup_complete,
            bodyMetrics: {
                heightInches: height ?? null,
                weightPounds: weight ?? null,
                bmi: bmi,
                bmiCategory: bmiCategory,
            },
            healthProfile: {
                medicalHistory: profile.medical_history ?? [],
                dietRestrictions: profile.diet_restrictions ?? [],
            },
            habitsAndLifestyle: {
                occupation: profile.occupation ?? null,
                fitnessLevel: profile.fitness_level ?? null,
                averageCalories: profile.avg_calories ?? null,
                currentEnergy: profile.current_energy ?? null,
                averageSleep: profile.avg_sleep ?? null,
                gender: profile.gender ?? null,
                goals: profile.goals ?? [],
                hobbies: profile.hobbies ?? [],
            },
        };

        // Loads saved chatbot rules.
        const savedRules = await ChatRule.find({ user_id: user._id })
            .sort({ createdAt: 1 })
            .limit(10)
            .lean();

        const userRules = savedRules.map((savedRule) => savedRule.rule);
        const customRulesPrompt = buildCustomRulesPrompt(userRules);

        const recentMessages = await ChatMessage.find({ user_id: user._id })
            .sort({ createdAt: -1 })
            .limit(CHAT_HISTORY_LIMIT)
            .lean();

        const historyForPrompt = recentMessages
            .reverse()
            .map((chat) => ({
                role: chat.role,
                content: chat.content,
            }));

        // Saves the user message.
        await ChatMessage.create({
            user_id: user._id,
            role: "user",
            content: message,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "system",
                    content: `User profile context: ${JSON.stringify(profileSummary)}`,
                },
                {
                    role: "system",
                    content: customRulesPrompt,
                },
                ...historyForPrompt,
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const reply = completion.choices[0]?.message?.content || "I could not create a response.";

        // Saves the chatbot reply.
        await ChatMessage.create({
            user_id: user._id,
            role: "assistant",
            content: reply,
        });

        // Keeps saved history limited.
        await trimOldChatMessages(user._id);

        return NextResponse.json({ reply });
    }
    catch (error) {
        console.error("Chat API error:", error);

        return NextResponse.json(
            { error: "Chat response failed." },
            { status: 500 }
        );
    }
}
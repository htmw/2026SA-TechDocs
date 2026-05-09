import { DailyLog } from "@/database/models/daily_log";
import { Recipe } from "@/database/models/recipe";
import { createDateValidator } from "@/lib/api/middleware";
import { createApiRoute, createTypedApiRoute } from "@/lib/api/route";
import { getEnv } from "@/lib/env";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema, CravingPromptSchema } from "@/lib/zod_schemas/health_schema";
import { calculateDietaryGuidelines } from "@/lib/utils/nutrition_utils";
import { NextResponse } from "next/server";
import { parse } from "path";
import z from "zod";

export const POST = createApiRoute(
    async ({ user, body }) => {
        const parsed = body as z.infer<typeof CravingPromptSchema>;
        const prompt = parsed.craving_prompt;
        const profile = user.profile;

        const guidelines = calculateDietaryGuidelines(profile?.goals ?? [], profile);

        //Logic to calculate remaining calories for user
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyLog = await DailyLog.findOne({
            user_id: user._id,
            date: today,
        });

        const totalCalories = dailyLog?.meals?.reduce(
        (total, meal) => total + meal.calories,
        0
        ) ?? 0;

        const remainingCalories = Math.max(guidelines.calories - totalCalories, 0);
        
        const recommender_url = new URL("/recommend", getEnv().AI_RECOMMENDER_URL).href;
        const aiResponse = await fetch(recommender_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            } ,
            body: JSON.stringify({
                hungerLevel: 3,
                craving: prompt,
                mealType: "any",
                topN: 5,
                maxCalories: remainingCalories,
            }),
        });

        if (!aiResponse.ok) {
            return NextResponse.json(
                createErrorResponse("AI_BACKEND_ERROR", "AI backend failed"),
            { status: 500 }
            );
            }

            const aiData = await aiResponse.json();
            if (!aiData.recommendations || aiData.recommendations.length === 0) {
                return NextResponse.json(
                    createSuccessResponse({
                        recipes: [],
                        recipe: null,
                        message: "Sorry, there are no recommendations within your calorie limit.",
                    }),
                    { status: 200 }
                );
            }

            let recipes = aiData.recommendations ?? [];
            recipes = recipes.map((recipe: any) => {
                recipe.categories = recipe.categories.split(" ");
                return recipe;
            });

            const payload = { 
                recipes,
                recipe: recipes[0]
             };
            const normalizedPayload = normalizeDocument(payload);

            return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: CravingPromptSchema }
);
import { DailyLog } from "@/database/models/daily_log";
import { Recipe } from "@/database/models/recipe";
import { createDateValidator } from "@/lib/api/middleware";
import { createApiRoute, createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema, CravingPromptSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import { parse } from "path";
import z from "zod";

export const POST = createApiRoute(
    async ({ user, body }) => {
        const parsed = body as z.infer<typeof CravingPromptSchema>;
        const prompt = parsed.craving_prompt;
        const profile = user.profile;

        // Call AI Backend
        // 5 second delay for ai
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const aiResponse = await fetch("http://127.0.0.1:8000/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            } ,
            body: JSON.stringify({
                hungerLevel: 3,
                craving: prompt,
                mealType: "any",
                topN: 1,
            }),
        });

        if (!aiResponse.ok) {
            return NextResponse.json(
                createErrorResponse("AI_BACKEND_ERROR", "AI backend failed"),
            { status: 500 }
            );
            }

           const aiData = await aiResponse.json();

            const recipe = aiData.recommendations?.[0];

            const payload = { recipe };
            const normalizedPayload = normalizeDocument(payload);

            return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
        //const recipes = await Recipe.search({
         //   title_contains: "ham persillade with mustard potato salad and mashed peas",
          //  limit: "1"
        //});

        //const payload = { recipe: recipes.recipes[0] };
        //const normalizedPayload = normalizeDocument(payload);
        //return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });

        
    },
    { body_schema: CravingPromptSchema }
);
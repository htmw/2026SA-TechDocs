import { DailyLog } from "@/database/models/daily_log";
import { Recipe } from "@/database/models/recipe";
import { createDateValidator } from "@/lib/api/middleware";
import { createApiRoute, createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema, CravingPromptSchema, HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import z from "zod";

export const POST = createApiRoute(
    async ({ body }) => {
        const parsed = body as z.infer<typeof HungerEventZodSchema>;

        // Call AI Backend
        // 5 second delay for ai
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const recipes = await Recipe.search({
            title_contains: "ham persillade with mustard potato salad and mashed peas",
            limit: "1"
        });

        const payload = { recipe: recipes.recipes[0] };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: HungerEventZodSchema.pick({ hunger_level: true }) }
);
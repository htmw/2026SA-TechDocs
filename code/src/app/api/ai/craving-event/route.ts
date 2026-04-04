import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator } from "@/lib/api/middleware";
import { createApiRoute, createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import z from "zod";

export const POST = createApiRoute(
    async ({ body }) => {
        const parsed = body as z.infer<typeof CravingEventSchema>;

        // Call AI Backend
        // 5 second delay for ai
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const recipe = {
            title: ["Grilled Chicken", "Fried Rice", "Salad", "Salmon", "Tacos"][Math.floor(Math.random() * 5)],
            ingredients: [[ "Ingredient 1" ], [ "Ingredient 2" ], [ "Ingredient 3" ], [ "Ingredient 4" ], [ "Ingredient 1" , "Ingredient 2", "Ingredient 3" ], [ "Ingredient 1" , "Ingredient 2" ]][Math.floor(Math.random() * 3)],
            directions: "1. Step 1\n2. Step 2\n3. Done",
            nutrition: "Calories: 500, Protein: 30g, Fat: 20g, Carbs: 50g"
        }

        const payload = { recipe: recipe };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: CravingEventSchema }
);
import { Food } from "@/database/models/food";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { createApiRoute } from "@/lib/api/route";
import { NextResponse } from "next/server";
import { Recipe } from "@/database/models/recipe";

export const GET = createApiRoute(async ({ user, req }) => {
    const { searchParams } = new URL(req.url);
    const allParams = Object.fromEntries(searchParams.entries());

    let result;
    try {
        result = await Recipe.search(allParams);
    } catch (err) {
        console.error("Recipe search error", err);
        return NextResponse.json(
            createErrorResponse("INVALID_FILTER", (err as Error).message || "Invalid search filter"),
            { status: 400 }
        );
    }

    const payload = {
        recipes: result.recipes,
        pagination: result.pagination,
    };

    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
});

import { Food } from "@/database/models/food";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { createApiRoute } from "@/lib/api/route";
import { NextResponse } from "next/server";

export const GET = createApiRoute(async ({ user, req }) => {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    let limit = 100;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return NextResponse.json(
                createErrorResponse("INVALID_LIMIT", "The 'limit' query parameter must be a positive integer"),
                { status: 400 }
            );
        }
        limit = Math.min(parsed, 500);
    }

    let page = 1;
    if (pageParam) {
        const parsed = parseInt(pageParam, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return NextResponse.json(
                createErrorResponse("INVALID_PAGE", "The 'page' query parameter must be a positive integer"),
                { status: 400 }
            );
        }
        page = parsed;
    }

    const filter: Record<string, unknown> = {};
    if (query) {
        filter.food_item = { $regex: query, $options: "i" };
    }
    if (category) {
        filter.categories = { $in: [category] };
    }

    console.log(filter);

    const foods = await Food.find(filter)
        .sort({ food_item: 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

    const payload = {
        foods,
        pagination: {
            page,
            limit,
            count: foods.length,
        },
    };

    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
});

import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator } from "@/lib/api/middleware";
import { createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { MealZodSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import z from "zod";

type LocalRouteParams = { date: string };
type RouteLocals = {
    parsed_date?: Date;
};

const validateDate = createDateValidator<LocalRouteParams, RouteLocals>("parsed_date");

const createRoute = createTypedApiRoute<LocalRouteParams, unknown, RouteLocals>(
    validateDate
);

// create a new meal for the specified date
export const POST = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof MealZodSchema>;
        const parsed_date = locals.parsed_date!;

        let daily_log;
        try {
            daily_log = await DailyLog.getDailyLogByDate(user!._id, parsed_date);
        } catch (err) {
            console.error("Error fetching daily log:", err);
            return NextResponse.json(createErrorResponse("DAILY_LOG_FETCH_ERROR", "An error occurred while fetching the daily log"), { status: 500 });
        }
        
        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }
        console.log(daily_log);

        if (await daily_log.getMealByTime(parsed.logged_at)) {
            return NextResponse.json(createErrorResponse("MEAL_EXISTS", "A meal with that timestamp already exists"), { status: 409 });
        }
        //TODO: Check if the meal is on the same day
        const event = await daily_log.addMeal(parsed as any);

        const payload = { meal: event };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: MealZodSchema }
);

export const GET = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;

        let daily_log;
        try {
            daily_log = await DailyLog.getDailyLogByDate(user!._id, parsed_date);
        } catch (err) {
            console.error("Error fetching daily log:", err);
            return NextResponse.json(createErrorResponse("DAILY_LOG_FETCH_ERROR", "An error occurred while fetching the daily log"), { status: 500 });
        }

        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        // Ensure nested meal food refs are populated from the correct model (Food/Recipe/Custom)
        await daily_log.populate({ path: "meals.food_id" });

        const payload = { meals: daily_log.meals || [] };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }
);
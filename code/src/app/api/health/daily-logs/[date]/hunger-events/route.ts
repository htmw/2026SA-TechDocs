import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator } from "@/lib/api/middleware";
import { createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import z from "zod";

type LocalRouteParams = { date: string};
type RouteLocals = {
    parsed_date?: Date;
};

const validateDate = createDateValidator<LocalRouteParams, RouteLocals>("parsed_date");

const createRoute = createTypedApiRoute<LocalRouteParams, unknown, RouteLocals>(
    validateDate
);

// create a new hunger event for the specified date
export const POST = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof HungerEventZodSchema>;
        const parsed_date = locals.parsed_date!;

        let daily_log;
        try {
            daily_log = await DailyLog.getDailyLogByDate(user!._id, parsed_date);
            
            if (!daily_log) {
                daily_log = await DailyLog.createDailyLog(user!._id, {
                    date: parsed_date,
                    timezone: user?.profile?.timezone || "UTC",
                    morning_weight: user?.profile?.weight || 150,
                    sleep_hours: 8,
                    energy_rating: "energetic",
                    stress_level: "relaxed",
                });
            }
        } catch (err) {
            console.error("Error fetching or creating daily log:", err);
            return NextResponse.json(createErrorResponse("DAILY_LOG_ERROR", "An error occurred while fetching or creating the daily log"), { status: 500 });
        }

        if (daily_log.getHungerEventByTime(parsed.occurred_at)) {
            return NextResponse.json(createErrorResponse("HUNGER_EVENT_EXISTS", "An event with that timestamp already exists"), { status: 409 });
        }

        //TODO: Check if the hunger event is on the same day
        const event = await daily_log.addHungerEvent(parsed as any);

        const payload = { hunger_event: event };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: HungerEventZodSchema }
);

export const GET = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;

        const daily_log = await DailyLog.getDailyLogByDate(user!._id, parsed_date);
        if (!daily_log) {
            const payload = { hunger_events: [] };
            return NextResponse.json(createSuccessResponse(payload), { status: 200 });
        }

        const payload = { hunger_events: daily_log.hunger_events || [] };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }
);

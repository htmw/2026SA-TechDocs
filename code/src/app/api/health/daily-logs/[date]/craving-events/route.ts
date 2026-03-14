import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator } from "@/lib/api/middleware";
import { createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema } from "@/lib/zod_schemas/health_schema";
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

export const POST = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof CravingEventSchema>;
        const parsed_date = locals.parsed_date!;

        const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        if (daily_log.getCravingEventByTime(parsed.occurred_at)) {
            return NextResponse.json(createErrorResponse("CRAVING_EVENT_EXISTS", "An event with that timestamp already exists"), { status: 409 });
        }

        //TODO: Check if the craving event is on the same day
        const event = await daily_log.addCravingEvent(parsed as any);

        const payload = { craving_event: event };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    }
);

export const GET = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;
        
        const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        const payload = { craving_events: daily_log.craving_events || [] };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }
);

import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { getTimezoneDayString, normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
import { isValid } from "date-fns";
import { NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api/route";
import z from "zod";

//This route only handles top level daily log data (not meals, hunger events, or craving events - those have their own routes)

export const POST = createApiRoute(
    async ({ user, body }) => {
        const parsed = body as z.infer<typeof DailyLogZodSchema>;

        const timezone = user.profile?.timezone || "UTC";
        const parsed_date = normalizeDateToTimezoneDay(getTimezoneDayString(parsed.date, timezone), timezone);

        if (!isValid(parsed_date)) {
            return NextResponse.json(
                createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
                { status: 400 }
            );
        }

        //Check if daily log already exists for this date
        const dailyLogExists = await DailyLog.hasDailyLog(user._id, parsed_date);
        if (dailyLogExists) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_EXISTS", "A daily log for this date already exists"), { status: 409 });
        }

        //Create daily log
        try {
            const createPayload = {
                ...parsed,
                date: parsed_date,
                timezone,
            };
            const createdLog = await DailyLog.createDailyLog(user._id, createPayload);
            if (!createdLog) {
                return NextResponse.json(createErrorResponse("DAILY_LOG_CREATION_FAILED", "Failed to create daily log"), { status: 500 });
            }

        const payload = {
            daily_log: createdLog,
        };

        const normalizedPayload = normalizeDocument(payload);

        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_EXISTS", "A daily log for this date already exists"), { status: 409 });
        }
        throw error;  
    }
    },
    { body_schema: DailyLogZodSchema }
);

export const GET = createApiRoute(async ({ user, req }) => {
    const { searchParams } = new URL(req.url);
    const timezone = user.profile?.timezone || "UTC";
    const queryParams = Object.fromEntries(searchParams.entries()) as Record<string, string | undefined>;

    let logs;
    try {
        ({ logs } = await DailyLog.searchDailyLogs(user._id, queryParams, timezone));
    } catch (err: any) {
        console.error("Error searching daily logs", err);
        if (err?.message === "INVALID_START_DATE" || err?.message === "INVALID_END_DATE") {
            return NextResponse.json(createErrorResponse(err.message, `${err.message.toLowerCase().replace("_", " ")}`), { status: 400 });
        }
        return NextResponse.json(createErrorResponse("INVALID_QUERY", (err as Error).message || "Invalid query parameters"), { status: 400 });
    }

    const payload = { daily_logs: logs };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
});
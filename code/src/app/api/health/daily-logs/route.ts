import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { getTimezoneDayString, normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
import { isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

//This route only handles top level daily log data (not meals, hunger events, or craving events - those have their own routes)

export async function POST(req: NextRequest) {
    //Body must be JSON
    let body: unknown;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json(
            createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"),
            { status: 400 }
        );
    }
    
    //Validate body with daily log schema
    const parsed = DailyLogZodSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
    }

    //Check if authenticated
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }
    
    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(getTimezoneDayString(parsed.data.date, timezone), timezone);

    if (!isValid(parsed_date)) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    console.log(parsed_date);


    //Check if daily log already exists for this date
    const dailyLogExists = await DailyLog.hasDailyLog(user._id, parsed_date);
    if (dailyLogExists) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_EXISTS", "A daily log for this date already exists"), { status: 409 });
    }

    //Create daily log
    const createdLog = await DailyLog.createDailyLog(user._id, parsed.data);
    if (!createdLog) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_CREATION_FAILED", "Failed to create daily log"), { status: 500 });
    }

    const payload = {
        daily_log: createdLog,
    };

    const normalizedPayload = normalizeDocument(payload);

    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const start_date =searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const limitParam = searchParams.get("limit");

    let limit = 10;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return NextResponse.json(
                createErrorResponse("INVALID_LIMIT", "The 'limit' query parameter must be a positive integer"),
                { status: 400 }
            );
        }
        // cap limit of 100
        limit = Math.min(parsed, 100);
    }

    // authenticate user
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const timezone = user.profile?.timezone || "UTC";
    let parsed_start_date: Date | null = start_date ? normalizeDateToTimezoneDay(start_date, timezone) : null;
    let parsed_end_date: Date | null = end_date ? normalizeDateToTimezoneDay(end_date, timezone) : null;

    if (!isValid(parsed_start_date)) {
        parsed_start_date = null;
    }

    if (!isValid(parsed_end_date)) {
        parsed_end_date = null;
    }

    // Build query for daily logs (optionally filtered by start/end date)
    const query: Record<string, unknown> = { user_id: user._id };

    const dateQuery: Record<string, unknown> = {};
    if (parsed_start_date) {
        dateQuery.$gte = parsed_start_date;
    }
    if (parsed_end_date) {
        dateQuery.$lte = parsed_end_date;
    }
    if (Object.keys(dateQuery).length > 0) {
        query.date = dateQuery;
    }

    // get daily logs sorted by the most recent
    const logs = await DailyLog.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .exec();

    const payload = { daily_logs: logs };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}
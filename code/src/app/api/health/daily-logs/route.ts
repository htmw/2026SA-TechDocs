import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
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

    //Check if daily log already exists for this date
    const dailyLogExists = await DailyLog.hasDailyLog(user._id, parsed.data.date);
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

    // get daily logs sorted by the most recent
    const logs = await DailyLog.find({ user_id: user._id })
        .sort({ date: -1 })
        .limit(limit)
        .exec();

    const payload = { daily_logs: logs };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}
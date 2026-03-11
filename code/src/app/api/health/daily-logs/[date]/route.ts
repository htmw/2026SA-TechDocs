import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { DailyLogValues, DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type Params = { date: string };

function parseDateParam(dateParam: string) {
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) return null;
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
    const { date } = await params;
    const parsed_date = parseDateParam(date);
    if (!parsed_date) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    //Check if authenticated
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
    if (!daily_log) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
    }

    const payload = { daily_log: daily_log };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
    const { date } = await params;
    const parsed_date = parseDateParam(date);
    // parse patch body
    let body: unknown;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json(
            createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"),
            { status: 400 }
        );
    }

    const parsed = DailyLogZodSchema.partial().safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors),
            { status: 422 }
        );
    }

    const updates = { ...parsed.data } as Partial<DailyLogValues>;
    delete updates.date;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(createErrorResponse("NO_FIELDS_TO_UPDATE", "No fields were provided to update"), { status: 400 });
    }

    if (!parsed_date) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    //Check if authenticated
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
    if (!daily_log) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
    }

    Object.assign(daily_log as any, updates as any);

    try {
        await daily_log.save();
    } catch (err) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_UPDATE_FAILED", "Failed to update daily log"), { status: 500 });
    }

    const payload = { daily_log: daily_log };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
    const { date } = await params;
    const parsed_date = parseDateParam(date);

    let body: unknown;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json(
            createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"),
            { status: 400 }
        );
    }

    if (!parsed_date) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    // include date from params for validation
    const parsed = DailyLogZodSchema.safeParse({ ...(body as any), date });
    if (!parsed.success) {
        return NextResponse.json(
            createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors),
            { status: 422 }
        );
    }

    //Check if authenticated
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const existing = await DailyLog.getDailyLogByDate(user._id, parsed_date);
    if (existing) {
        existing.morning_weight = parsed.data.morning_weight;
        existing.energy_rating = parsed.data.energy_rating;
        existing.sleep_hours = parsed.data.sleep_hours;
        existing.stress_level = parsed.data.stress_level;
        try {
            await existing.save();
        } catch (err) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_UPDATE_FAILED", "Failed to update daily log"), { status: 500 });
        }

        const payload = { daily_log: existing };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }

    const created_log = await DailyLog.createDailyLog(user._id, parsed.data);
    if (!created_log) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_CREATION_FAILED", "Failed to create daily log"), { status: 500 });
    }

    const payload = { daily_log: created_log };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
    const { date } = await params;
    const parsed_date = parseDateParam(date);

    if (!parsed_date) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    // Check authentication
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
    if (!daily_log) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
    }

    try {
        await daily_log.deleteOne();
    } catch (err) {
        return NextResponse.json(createErrorResponse("DAILY_LOG_DELETE_FAILED", "Failed to delete daily log"), { status: 500 });
    }

    return NextResponse.json(createSuccessResponse({}), { status: 200 });
}

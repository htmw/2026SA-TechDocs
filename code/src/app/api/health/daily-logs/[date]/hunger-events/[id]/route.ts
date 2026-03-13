import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";
import { isValid } from "date-fns";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type Params = { date: string, id: string };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date, id } = await params;

    // Check authentication
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(date, timezone);

    if (!isValid(parsed_date)) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

	const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
    if (!daily_log) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

    if(!isValidObjectId(id)){
		return NextResponse.json(createErrorResponse("INVALID_ID_PARAM", "The 'id' parameter is not a valid id"), { status: 400 });
    }

	const payload = daily_log.getHungerEvent(new Types.ObjectId(id));
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date, id } = await params;

    // Check authentication
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

	let body: unknown;
	try {
		body = await req.json();
	} catch (e) {
		return NextResponse.json(createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"), { status: 400 });
	}

	const parsed = HungerEventZodSchema.partial().safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

	// occurred_at is required to patch
	if (!parsed.data.occurred_at) {
		return NextResponse.json(createErrorResponse("MISSING_FIELD", "occurred_at is required to patch an event"), { status: 400 });
	}

    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(date, timezone);

    if (!isValid(parsed_date)) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

	const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!daily_log) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

    if(!isValidObjectId(id)){
		return NextResponse.json(createErrorResponse("INVALID_ID_PARAM", "The 'id' parameter is not a valid id"), { status: 400 });
    }

	const updated = await daily_log.updateHungerEvent(new Types.ObjectId(id), parsed.data as any);
	if (!updated) {
		return NextResponse.json(createErrorResponse("HUNGER_EVENT_NOT_FOUND", "No matching hunger event found"), { status: 404 });
	}

	const payload = { hunger_event: updated };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date, id } = await params;

	let body: unknown;
	try {
		body = await req.json();
	} catch (e) {
		return NextResponse.json(createErrorResponse("INVALID_JSON_BODY", "The request body is not valid JSON"), { status: 400 });
	}

	const parsed = HungerEventZodSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

    // Check authentication
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(date, timezone);

    if (!isValid(parsed_date)) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

	const dailyLog = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!dailyLog) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

    if(!isValidObjectId(id)){
		return NextResponse.json(createErrorResponse("INVALID_ID_PARAM", "The 'id' parameter is not a valid id"), { status: 400 });
    }

	// attempt update first
	const updated_event = await dailyLog.updateHungerEvent(new Types.ObjectId(id), parsed.data as any);
	if (updated_event) {
		const payload = { hunger_event: updated_event };
		const normalizedPayload = normalizeDocument(payload);
		return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
	}

	// otherwise create
	try {
		await dailyLog.addHungerEvent(parsed.data as any);
	} catch (err) {
		return NextResponse.json(createErrorResponse("HUNGER_EVENT_CREATION_FAILED", "Failed to create hunger event"), { status: 500 });
	}
	const payload = { hunger_event: parsed.data };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date, id } = await params;

    // Check authentication
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(date, timezone);

    if (!isValid(parsed_date)) {
        return NextResponse.json(
            createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
            { status: 400 }
        );
    }

    if(!isValidObjectId(id)){
		return NextResponse.json(createErrorResponse("INVALID_ID_PARAM", "The 'id' parameter is not a valid id"), { status: 400 });
    }

	const dailyLog = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!dailyLog) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}
    
    const deleted = await dailyLog.deleteHungerEvent(new Types.ObjectId(id));
	if (!deleted) {
		return NextResponse.json(createErrorResponse("HUNGER_EVENT_NOT_FOUND", "No matching hunger event found"), { status: 404 });
	}
	return NextResponse.json(createSuccessResponse({}), { status: 200 });
}

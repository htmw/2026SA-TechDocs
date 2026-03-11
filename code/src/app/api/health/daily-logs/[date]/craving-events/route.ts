import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { CravingEventSchema } from "@/lib/zod_schemas/health_schema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type Params = { date: string };

function parseDateParam(dateParam: string) {
	const date = new Date(dateParam);
	if (isNaN(date.getTime())) return null;
	// normalize to midnight UTC so matching works
	date.setUTCHours(0, 0, 0, 0);
	return date;
}

// create a new craving event for the specified date
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;
	const parsed_date = parseDateParam(date);
	if (!parsed_date) {
		return NextResponse.json(createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"), { status: 400 });
	}

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

	const parsed = CravingEventSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

	const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!daily_log) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

	if (daily_log.getCravingEvent(parsed.data.occurred_at)) {
		return NextResponse.json(createErrorResponse("CRAVING_EVENT_EXISTS", "An event with that timestamp already exists"), { status: 409 });
	}

    //TODO: Check if the craving event is on the same day
	const event = await daily_log.addCravingEvent(parsed.data as any);

	const payload = { craving_event: event };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;
	const parsed_date = parseDateParam(date);
	if (!parsed_date) {
		return NextResponse.json(createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"), { status: 400 });
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

	const payload = { craving_events: daily_log.craving_events || [] };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;
	const parsed_date = parseDateParam(date);
	if (!parsed_date) {
		return NextResponse.json(createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"), { status: 400 });
	}

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

	const parsed = CravingEventSchema.partial().safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

	// occurred_at is required to patch
	if (!parsed.data.occurred_at) {
		return NextResponse.json(createErrorResponse("MISSING_FIELD", "occurred_at is required to patch an event"), { status: 400 });
	}
	const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!daily_log) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

	const updated = await daily_log.updateCravingEvent(parsed.data.occurred_at, parsed.data as any);
	if (!updated) {
		return NextResponse.json(createErrorResponse("CRAVING_EVENT_NOT_FOUND", "No matching craving event found"), { status: 404 });
	}

	const payload = { craving_event: updated };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;
	const parsed_date = parseDateParam(date);

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

	const parsed = CravingEventSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}
	if (!parsed_date) {
		return NextResponse.json(createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"), { status: 400 });
	}

	const dailyLog = await DailyLog.getDailyLogByDate(user._id, parsed_date);
	if (!dailyLog) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

	// attempt update first
	const updated_event = await dailyLog.updateCravingEvent(parsed.data.occurred_at, parsed.data as any);
	if (updated_event) {
		const payload = { craving_event: updated_event };
		const normalizedPayload = normalizeDocument(payload);
		return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
	}
	// otherwise create
	try {
		await dailyLog.addCravingEvent(parsed.data as any);
	} catch (err) {
		return NextResponse.json(createErrorResponse("CRAVING_EVENT_CREATION_FAILED", "Failed to create craving event"), { status: 500 });
	}
	const payload = { craving_event: parsed.data };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;
	const parsedDate = parseDateParam(date);

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

	const parsed = z.object({ occurred_at: z.coerce.date() }).safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body must contain occurred_at", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

	if (!parsedDate) {
		return NextResponse.json(createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"), { status: 400 });
	}

	const dailyLog = await DailyLog.getDailyLogByDate(user._id, parsedDate);
	if (!dailyLog) {
		return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
	}

    const deleted = await dailyLog.deleteCravingEvent(parsed.data.occurred_at);
	if (!deleted) {
		return NextResponse.json(createErrorResponse("CRAVING_EVENT_NOT_FOUND", "No matching craving event found"), { status: 404 });
	}
	return NextResponse.json(createSuccessResponse({}), { status: 200 });
}

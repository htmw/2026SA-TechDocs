import { getCurrentSession } from "@/app/actions";
import { DailyLog } from "@/database/models/daily_log";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";
import { isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type Params = { date: string };

// create a new hunger event for the specified date
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date: search_date } = await params;

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

	const parsed = HungerEventZodSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
	}

    const timezone = user.profile?.timezone || "UTC";
    const parsed_date = normalizeDateToTimezoneDay(search_date, timezone);

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

	if (daily_log.getHungerEventByTime(parsed.data.occurred_at)) {
		return NextResponse.json(createErrorResponse("HUNGER_EVENT_EXISTS", "An event with that timestamp already exists"), { status: 409 });
	}

    //TODO: Check if the hunger event is on the same day
	const event = await daily_log.addHungerEvent(parsed.data as any);

	const payload = { hunger_event: event };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
	const { date } = await params;

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

	const payload = { hunger_events: daily_log.hunger_events || [] };
	const normalizedPayload = normalizeDocument(payload);
	return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

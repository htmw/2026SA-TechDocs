import { DailyLog } from "@/database/models/daily_log";
import { createApiRoute, ApiRouteContext } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { NextResponse } from "next/server";
import { isValid, format } from "date-fns";

export const GET = createApiRoute(async (context: ApiRouteContext) => {
    const { user, req } = context;
    const searchParams = new URL(req.url).searchParams;
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const statusParam = searchParams.get("status");

    if (!start_date && !end_date) {
        return NextResponse.json(
            createErrorResponse("MISSING_DATE_RANGE", "Either start_date or end_date query parameter must be provided"),
            { status: 400 }
        );
    }

    const timezone = user?.profile?.timezone || "UTC";
    let dateQuery: Record<string, unknown> = {};

    if (start_date) {
        const parsedStart = normalizeDateToTimezoneDay(start_date, timezone);
        if (!isValid(parsedStart)) {
            return NextResponse.json(
                createErrorResponse("INVALID_START_DATE", "start_date must be a valid date"),
                { status: 400 }
            );
        }
        dateQuery.$gte = parsedStart;
    }

    if (end_date) {
        const parsedEnd = normalizeDateToTimezoneDay(end_date, timezone);
        if (!isValid(parsedEnd)) {
            return NextResponse.json(
                createErrorResponse("INVALID_END_DATE", "end_date must be a valid date"),
                { status: 400 }
            );
        }
        dateQuery.$lte = parsedEnd;
    }

    const query: Record<string, any> = {
        user_id: user!._id,
    };

    const allowedStatusKeys = ["daily_checkins", "meals", "hunger_events", "craving_events"];
    const status = statusParam ? statusParam.trim().toLowerCase() : "daily_checkins";
    if (status && !allowedStatusKeys.includes(status)) {
        return NextResponse.json(
            createErrorResponse("INVALID_STATUS", "Invalid status value. Must be one of daily_checkins, meals, hunger_events, craving_events"),
            { status: 400 }
        );
    }

    if (Object.keys(dateQuery).length > 0) {
        query.date = dateQuery;
    }

    let logs;
    try {
        const includeFields = ["date"];
        if (status === "meals") includeFields.push("meals");
        if (status === "hunger_events") includeFields.push("hunger_events");
        if (status === "craving_events") includeFields.push("craving_events");

        logs = await DailyLog.find(query)
            .select(includeFields.join(" "))
            .sort({ date: 1 })
            .exec();
    } catch (err) {
        console.error("Error fetching daily log status:", err);
        return NextResponse.json(
            createErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch daily log meal status"),
            { status: 500 }
        );
    }

    const days = logs.map((log) => {
        const row: Record<string, any> = { date: format(log.date, "yyyy-MM-dd") };

        if (status === "daily_checkins") {
            row.daily_checkins = true;
        }
        if (status === "meals") {
            row.meals = Array.isArray((log as any).meals) ? (log as any).meals.length : 0;
        }
        if (status === "hunger_events") {
            row.hunger_events = Array.isArray((log as any).hunger_events) ? (log as any).hunger_events.length : 0;
        }
        if (status === "craving_events") {
            row.craving_events = Array.isArray((log as any).craving_events) ? (log as any).craving_events.length : 0;
        }

        return row;
    });

    const payload = { days };
    const normalizedPayload = normalizeDocument(payload);
    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
});

import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator } from "@/lib/api/middleware";
import { createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { DailyLogValues, DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
import { NextResponse } from "next/server";
import z from "zod";

type LocalRouteParams = { date: string, id: string };
type RouteLocals = {
    parsed_date?: Date;
};

const validateDate = createDateValidator<LocalRouteParams, RouteLocals>("parsed_date");

const createRoute = createTypedApiRoute<LocalRouteParams, unknown, RouteLocals>(
    validateDate
);

export const GET = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;

        const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        const payload = { daily_log: daily_log };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }
);

export const PATCH = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof DailyLogZodSchema>;
        const parsed_date = locals.parsed_date!;

        const updates = { ...parsed } as Partial<DailyLogValues>;
        delete updates.date;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(createErrorResponse("NO_FIELDS_TO_UPDATE", "No fields were provided to update"), { status: 400 });
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
    },
    { body_schema: DailyLogZodSchema.partial() }
);

export const PUT = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof DailyLogZodSchema>;
        const parsed_date = locals.parsed_date!;

        const existing = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (existing) {
            existing.morning_weight = parsed.morning_weight;
            existing.energy_rating = parsed.energy_rating;
            existing.sleep_hours = parsed.sleep_hours;
            existing.stress_level = parsed.stress_level;
            try {
                await existing.save();
            } catch (err) {
                return NextResponse.json(createErrorResponse("DAILY_LOG_UPDATE_FAILED", "Failed to update daily log"), { status: 500 });
            }

            const payload = { daily_log: existing };
            const normalizedPayload = normalizeDocument(payload);
            return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
        }

        const created_log = await DailyLog.createDailyLog(user._id, parsed as any);
        if (!created_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_CREATION_FAILED", "Failed to create daily log"), { status: 500 });
        }

        const payload = { daily_log: created_log };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: DailyLogZodSchema.omit("date") }
);

export const DELETE = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;

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
);

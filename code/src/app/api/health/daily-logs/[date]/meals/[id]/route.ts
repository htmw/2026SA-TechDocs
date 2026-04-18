import { DailyLog } from "@/database/models/daily_log";
import { createDateValidator, createObjectIdValidator } from "@/lib/api/middleware";
import { createTypedApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { MealZodSchema } from "@/lib/zod_schemas/health_schema";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import z from "zod";

type LocalRouteParams = { date: string, id: string };
type RouteLocals = {
    parsed_date?: Date;
    object_id?: Types.ObjectId;
};

const validateDate = createDateValidator<LocalRouteParams, RouteLocals>("parsed_date");
const validateObjectId = createObjectIdValidator<LocalRouteParams, RouteLocals>("object_id");

const createRoute = createTypedApiRoute<LocalRouteParams, unknown, RouteLocals>(
    validateDate,
    validateObjectId
);

export const GET = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;
        const object_id = locals.object_id!;

        const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!daily_log) {
            const payload = null;
            return NextResponse.json(createSuccessResponse(payload), { status: 200 });
        }

        const payload = await daily_log.getMeal(object_id);
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    }
);

export const PATCH = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof MealZodSchema>;
        const parsed_date = locals.parsed_date!;
        const object_id = locals.object_id!;

        if (!parsed.logged_at) {
            return NextResponse.json(createErrorResponse("MISSING_FIELD", "logged_at is required to patch a meal"), { status: 400 });
        }

        const daily_log = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!daily_log) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        const updated = await daily_log.updateMeal(object_id, parsed as any);
        if (!updated) {
            return NextResponse.json(createErrorResponse("MEAL_NOT_FOUND", "No matching meal found"), { status: 404 });
        }

        const payload = { meal: updated };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    },
    { body_schema: MealZodSchema.partial() }
);

export const PUT = createRoute(
    async ({ user, locals, body }) => {
        const parsed = body as z.infer<typeof MealZodSchema>;
        const parsed_date = locals.parsed_date!;
        const object_id = locals.object_id!;

        const dailyLog = await DailyLog.getDailyLogByDate(user._id, parsed_date);
        if (!dailyLog) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        // attempt update first
        const updated_event = await dailyLog.updateMeal(object_id, parsed as any);
        if (updated_event) {
            const payload = { meal: updated_event };
            const normalizedPayload = normalizeDocument(payload);
            return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
        }

        // otherwise create
        try {
            await dailyLog.addMeal(parsed as any);
        } catch (err) {
            return NextResponse.json(createErrorResponse("MEAL_CREATION_FAILED", "Failed to create meal"), { status: 500 });
        }
        const payload = { meal: parsed };
        const normalizedPayload = normalizeDocument(payload);
        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    },
    { body_schema: MealZodSchema }
);


export const DELETE = createRoute(
    async ({ user, locals }) => {
        const parsed_date = locals.parsed_date!;
        const object_id = locals.object_id!;

        const dailyLog = await DailyLog.getDailyLogByDate(user!._id, parsed_date);
        if (!dailyLog) {
            return NextResponse.json(createErrorResponse("DAILY_LOG_NOT_FOUND", "No daily log found for the specified date"), { status: 404 });
        }

        const deleted = await dailyLog.deleteMeal(object_id);
        if (!deleted) {
            return NextResponse.json(createErrorResponse("MEAL_NOT_FOUND", "No matching meal found"), { status: 404 });
        }
        return NextResponse.json(createSuccessResponse({}), { status: 200 });
    },
);

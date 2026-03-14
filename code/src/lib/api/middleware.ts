import { ApiMiddleware } from "@/lib/api/route";
import { createErrorResponse } from "@/lib/types/shared";
import { normalizeDateToTimezoneDay } from "@/lib/utils/utils";
import { isValid } from "date-fns";
import { isValidObjectId, Types } from "mongoose";
import { NextResponse } from "next/server";

/**
 * Creates a middleware function that validates and normalizes a `date` route param.
 * The validated and parsed date is stored into `ctx.locals[key]`.
 */
export const createDateValidator = <
    PathParams extends { date: string },
    Locals extends Record<string, unknown>,
>(key: string): ApiMiddleware<PathParams, unknown, Locals> => {
    return async (context) => {
        const { params, user, locals } = context;
        const timezone = user?.profile?.timezone || "UTC";
        const parsed_date = normalizeDateToTimezoneDay(params.date, timezone);

        if (!isValid(parsed_date)) {
            return NextResponse.json(
                createErrorResponse("INVALID_DATE_PARAM", "The 'date' parameter is not a valid date"),
                { status: 400 }
            );
        }

        (locals as any)[key] = parsed_date;
    };
};

/**
 * The validated and parsed date is stored into `ctx.locals[key]`.
 */
/**
 * Creates a middleware function that validates an `id` route param as a Mongo ObjectId.
 * The validated and parsed ObjectId is stored into `ctx.locals[key]`.
 */
export const createObjectIdValidator = <
    PathParams extends { id: string },
    Locals extends Record<string, unknown>,
>(key: string): ApiMiddleware<PathParams, unknown, Locals> => {
    return async (context) => {
        const { params, locals } = context;
        if (!isValidObjectId(params.id)) {
            return NextResponse.json(createErrorResponse("INVALID_ID_PARAM", "The 'id' parameter is not a valid id"), { status: 400 });
        }

        (locals as any)[key] = new Types.ObjectId(params.id);
    };
};
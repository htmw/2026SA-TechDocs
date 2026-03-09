import { getCurrentSession } from "@/app/actions";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { ProfileZodSchema } from "@/lib/zod_schemas/profile_setup_schema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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

    //Validate body with profile schema
    const parsed = ProfileZodSchema.partial().safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
    }

    //Check if authenticated and profile setup complete
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    if (!user.setup_complete) {
        return NextResponse.json(createErrorResponse("PROFILE_NOT_SETUP", "Your profile setup is not complete"), { status: 400 });
    }

    const updated_user = await user.updateProfile(parsed.data);

    if (!updated_user) {
        return NextResponse.json(createErrorResponse("PROFILE_UPDATE_FAILED", "Failed to update profile"), { status: 500 });
    }

    const payload = { user: updated_user.getPublicProfile() };
    const normalizedPayload = normalizeDocument(payload);

    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
}

export async function GET(req: NextRequest) {
    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    if (!user.setup_complete) {
        return NextResponse.json(createErrorResponse("PROFILE_NOT_SETUP", "Your profile setup is not complete"), { status: 400 });
    }

    return NextResponse.json(createSuccessResponse({ user: user.getPublicProfile() }), { status: 200 });
}
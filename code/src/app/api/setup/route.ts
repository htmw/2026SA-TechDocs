import { getCurrentSession } from "@/app/actions";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { ProfileZodSchema } from "@/lib/zod_schemas/profile_setup_schema";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest){
    
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

    //Validate body with setup schema
    const parsed = ProfileZodSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(createErrorResponse("VALIDATION_ERROR", "The request body is not valid", z.flattenError(parsed.error).fieldErrors), { status: 422 });
    }

    const { session, user } = await getCurrentSession();
    if (!session || !user) {
        return NextResponse.json(createErrorResponse("NOT_AUTHENTICATED", "You must be logged in to perform this action"), { status: 401 });
    }

    if (user.setup_complete) {
        return NextResponse.json(createErrorResponse("PROFILE_ALREADY_SETUP", "Your profile setup is already complete"), { status: 400 });
    }

    //Create user profile
    await user.completeFirstTimeSetup(parsed.data);

    const payload = { user: user.getPublicProfile() };
    const normalizedPayload = normalizeDocument(payload);

    return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
} 
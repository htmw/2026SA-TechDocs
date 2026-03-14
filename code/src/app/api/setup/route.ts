import { createApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { ProfileZodSchema } from "@/lib/zod_schemas/profile_setup_schema";
import { NextResponse } from "next/server";
import z from "zod";

export const POST = createApiRoute(
    async ({ user, body }) => {
        const parsed = body as z.infer<typeof ProfileZodSchema>;

        if (user.setup_complete) {
            return NextResponse.json(createErrorResponse("PROFILE_ALREADY_SETUP", "Your profile setup is already complete"), { status: 400 });
        }

        //Create user profile
        await user.completeFirstTimeSetup(parsed);

        const payload = { user: user.getPublicProfile() };
        const normalizedPayload = normalizeDocument(payload);

        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    },
    { body_schema: ProfileZodSchema }
);
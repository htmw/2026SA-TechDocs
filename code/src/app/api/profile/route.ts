import { createApiRoute } from "@/lib/api/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { ProfileZodSchema } from "@/lib/zod_schemas/profile_setup_schema";
import { NextResponse } from "next/server";
import z from "zod";

export const POST = createApiRoute(
    async ({ user, body }) => {
        const parsed = body as z.infer<typeof ProfileZodSchema>;

        if (!(user).setup_complete) {
            return NextResponse.json(createErrorResponse("PROFILE_NOT_SETUP", "Your profile setup is not complete"), { status: 400 });
        }

        const updated_user = await user.updateProfile(parsed);

        if (!updated_user) {
            return NextResponse.json(createErrorResponse("PROFILE_UPDATE_FAILED", "Failed to update profile"), { status: 500 });
        }

        const payload = { user: updated_user.getPublicProfile() };
        const normalizedPayload = normalizeDocument(payload);

        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    },
    { body_schema: ProfileZodSchema.partial() }
);

export const GET = createApiRoute(
    async ({ user }) => {
        if (!(user).setup_complete) {
            return NextResponse.json(createErrorResponse("PROFILE_NOT_SETUP", "Your profile setup is not complete"), { status: 400 });
        }

        return NextResponse.json(createSuccessResponse({ user: user.getPublicProfile() }), { status: 200 });
    }
);
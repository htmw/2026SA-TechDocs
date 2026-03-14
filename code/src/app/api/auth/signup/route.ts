import { Session } from "@/database/models/session";
import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { generateSessionToken, setSessionTokenCookie } from "@/lib/utils/session_utils";
import { SignupZodSchema } from "@/lib/zod_schemas/login_schema";
import { NextResponse } from "next/server";
import z from "zod";
import { User } from "@/database/models/user";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { createApiRoute } from "@/lib/api/route";

export const POST = createApiRoute(
    async ({ body }) => {
        const parsed = body as z.infer<typeof SignupZodSchema>;

        const { name, email, password } = parsed;

        //Check is email is available
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return NextResponse.json(createErrorResponse("EMAIL_ALREADY_IN_USE", "The provided email is already associated with an account"), { status: 409 });
        }

        //Create user
        const user = await User.createUserAccount(name, email, password);
        if (!user) {
            //TODO: need better error handling
            return NextResponse.json(createErrorResponse("USER_CREATION_ERROR", "Could not create user"), { status: 400 });
        }

        //Generate session token and create session
        const sessionToken = await generateSessionToken();
        const session = await Session.createSession(sessionToken, user._id);
        if (!session) {
            //TODO: need better error handling
            return NextResponse.json(createErrorResponse("SESSION_ERROR", "Could not create session"), { status: 400 });
        }

        await setSessionTokenCookie(sessionToken, session.expires_at);

        const payload = {
            user: user.getPublicProfile(),
            session: session!,
        };
        const normalizedPayload = normalizeDocument(payload);

        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 201 });
    }, 
    { body_schema: SignupZodSchema, require_auth: false }
);
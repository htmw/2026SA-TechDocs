import { createErrorResponse, createSuccessResponse } from "@/lib/types/shared";
import { generateSessionToken, setSessionTokenCookie } from "@/lib/utils/session_utils";
import { LoginZodSchema } from "@/lib/zod_schemas/login_schema";
import { NextResponse } from "next/server";
import z from "zod";
import { User } from "@/database/models/user";
import { Session } from "@/database/models/session";
import { ClientUser } from "@/lib/types/mongo_user_types";
import { ClientSession } from "@/lib/types/mongo_session_types";
import { normalizeDocument } from "@/lib/utils/database_utils";
import { createApiRoute } from "@/lib/api/route";

export interface LoginResponseBody {
    user: ClientUser,
    session: ClientSession,
}

export const POST = createApiRoute(
    async ({ body }) => {
        const parsed = body as z.infer<typeof LoginZodSchema>;

        const { email, password } = parsed;

        const user = await User.findByEmail(email);
        if (!user) {
            return NextResponse.json(createErrorResponse("INVALID_CREDENTIALS", "Email or password is invalid"), { status: 400 });
        }

        const passwordHash = await User.getUserPassword(user._id);//TODO: need to encrypt, plaintext
        if (!passwordHash) {
            return NextResponse.json(createErrorResponse("INVALID_CREDENTIALS", "Email or password is invalid"), { status: 400 });
        }

        const validPassword = passwordHash === password;
        if (!validPassword) {
            return NextResponse.json(createErrorResponse("INVALID_CREDENTIALS", "Email or password is invalid"), { status: 400 });
        }

        const sessionToken = await generateSessionToken();
        const session = await Session.createSession(sessionToken, user._id);
        if (!session) {
            return NextResponse.json(createErrorResponse("SESSION_ERROR", "Could not create session"), { status: 400 });
        }

        await setSessionTokenCookie(sessionToken, session.expires_at);

        const payload = {
            user: user.getPublicProfile(),
            session: session!,
        };

        const normalizedPayload = normalizeDocument(payload);

        return NextResponse.json(createSuccessResponse(normalizedPayload), { status: 200 });
    },
    { body_schema: LoginZodSchema, require_auth: false }
);
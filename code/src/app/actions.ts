"use server"

import { ISessionMethods, Session } from "@/database/models/session";
import { IUserMethods } from "@/database/models/user";
import { deleteSessionTokenCookie } from "@/lib/utils/session_utils";
import { ISession } from "@/lib/types/mongo_session_types";
import { IUser } from "@/lib/types/mongo_user_types";
import { HydratedDocument } from "mongoose";
import { cookies } from "next/headers";
import { cache } from "react";

export const getCurrentSession = cache(async (): Promise<{ session: HydratedDocument<ISession, ISessionMethods> | null, user: HydratedDocument<IUser, IUserMethods> | null }> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value ?? null;

    if (token === null) {
        return { session: null, user: null };
    }
    
    const result = await Session.validateSessionToken(token);

    return result ?? { session: null, user: null };
});

export const logoutAction = cache(async (): Promise<{ success: boolean; error?: string; data?: string }> => {
    const { session } = await getCurrentSession();
    if (session === null) {
        return { success: false, error: "No active session" };
    }
    await Session.invalidateSession(session._id);
    await deleteSessionTokenCookie();
    return { success: true, data: "Logged out successfully" };
});
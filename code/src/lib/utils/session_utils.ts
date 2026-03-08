"use server"

import { getEnv } from "@/lib/env";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { cache } from "react";

export const setSessionTokenCookie = cache(async (token: string, expiresAt?: Date): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        path: "/",
        secure: getEnv().NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt
    });
});

export const deleteSessionTokenCookie = cache(async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        httpOnly: true,
        path: "/",
        secure: getEnv().NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
    });
});

export const generateSessionToken = cache(async (): Promise<string> => {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
    return token;
});
"use server"

import { getCurrentSession } from "@/app/actions";
import { AuthProvider } from "@/lib/hooks/useAuthProvider";
import { ThemeProvider } from "@/components/providers/theme_provider"
import { AuthState } from "@/lib/types/shared";
import { normalizeDocument } from "@/lib/utils/database_utils";

export default async function Providers({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const { session, user } = await getCurrentSession();
    const normalizedSession = normalizeDocument(session);
    const normalizedUser = normalizeDocument(user?.getPublicProfile() ?? null);
    const normalized = { session: normalizedSession, user: normalizedUser } as AuthState;
    
    return (
        <>
            <AuthProvider initialValue={normalized}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </AuthProvider>
        </>
    );
}
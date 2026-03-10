"use client"

import { logoutAction } from "@/app/actions";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useRouter } from "next/navigation";

export const useLogout = () => {
    const { setAuthState } = useAuth();
    const router = useRouter();

    const logout = async (callback?: () => void) => {
        try {
            const res = await logoutAction();
            
            if (res.success) {
                setAuthState({ user: null, session: null });
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            callback?.();
        }
    };

    return { logout };
};
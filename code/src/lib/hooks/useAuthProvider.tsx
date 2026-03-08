"use client";

import { AuthState } from "@/lib/types/shared";
import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

type AuthContextValue = AuthState & {
    setAuthState: (next: AuthState) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
    children,
    initialValue,
}: {
    children: ReactNode;
    initialValue: AuthState;
}) {
    const [state, setState] = useState<AuthState>(initialValue);

    const value: AuthContextValue = {
        ...state,
        setAuthState: (next) => setState(next),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within <AuthProvider>");
    }
    return ctx;
}

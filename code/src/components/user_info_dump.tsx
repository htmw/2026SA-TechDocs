"use client"

import { useAuth } from "@/lib/hooks/useAuthProvider";

//This is a temporary component that will be used to dump user information and session information
export default function UserInfoDump() {
    const { user, session } = useAuth();
    return <>
        <h1>User Info Dump</h1>
        <pre>{JSON.stringify({ user, session }, null, 2)}</pre>
    </>;
}

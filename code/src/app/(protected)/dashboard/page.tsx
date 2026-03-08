"use client"

import UserInfoDump from "@/components/user_info_dump";

export default function DashboardPage() {

    return (<>
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <UserInfoDump />
        </div>
    </>);
}
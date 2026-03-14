"use client"

import { GreetingsCard } from "@/components/cards/greetings_card";
import { WeightCard } from "@/components/cards/weight_card";
import { useAuth } from "@/lib/hooks/useAuthProvider"
import { useDailyLogs } from "@/lib/hooks/useDailyLog";
import { format } from "date-fns";

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs();

    const data = daily_logs.map(log => ({
        date: format(new Date(log.date), "MM/dd"),
        weight: log.morning_weight,
    })).reverse();

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 md: grid-cols-2">
                <div>
                    <GreetingsCard name={user?.name || "User"} timezone={user?.profile.timezone}></GreetingsCard>
                </div>
                <div className="flex flex-col justify-items-center">
                    <WeightCard weight_data={data} />
                </div>
            </div>
        </>
    );
}
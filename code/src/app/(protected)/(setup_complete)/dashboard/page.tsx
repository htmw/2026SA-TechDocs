"use client"

import { EnergyCard } from "@/components/cards/energy_card";
import { GreetingsCard } from "@/components/cards/greetings_card";
import { SleepCard } from "@/components/cards/sleep_card";
import { StressCard } from "@/components/cards/stress_card";
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
        sleep: log.sleep_hours,
        energy: log.energy_rating,
        stress: log.stress_level,
    })).reverse();

    return (
    <>
        <div className="gap-5 p-6 grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-5">
                <GreetingsCard name={user?.name || "User"} timezone={user?.profile.timezone} />
                <SleepCard sleep_data={data} />
                <StressCard stress_data={data} />
            </div>
            <div className="flex flex-col justify-items-center gap-5">
                <WeightCard weight_data={data} />
                <EnergyCard energy_data={data} />
            </div>
        </div>
    </>
    );
}
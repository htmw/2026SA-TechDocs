import { GreetingsCard } from "@/components/cards/greetings_card";
import { SleepCard } from "@/components/cards/chart_cards/sleep_card";
import { StressCard } from "@/components/cards/chart_cards/stress_card";
import { WeightCard } from "@/components/cards/chart_cards/weight_card";
import { EnergyCard } from "@/components/cards/chart_cards/energy_card";
import { TrendCard } from "@/components/cards/trend_cards/trend_card";

export default async function DashboardPage() {
    return (
        <div className="gap-5 p-6 grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-5">
                <GreetingsCard />
                <TrendCard />
                <SleepCard />
                <StressCard />
            </div>
            <div className="flex flex-col justify-items-center gap-5">
                <WeightCard />
                <EnergyCard />
            </div>
        </div>
    );
}
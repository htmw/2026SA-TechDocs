"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DailyCheckInSummaryCard } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { NutrientGapCard } from "@/components/cards/nutrient_gap_card";
import { MealsCard } from "@/components/cards/meal_cards/meals_cards";
import { CheckInCard } from "@/components/cards/check_in_card";
import { tz } from "@date-fns/tz";
import { useAuth } from "@/lib/hooks/useAuthProvider";

export default function DailyLogPage() {
    // reads the popup action from the URL after Hunger Check or Craving Check redirects here
    const searchParams = useSearchParams();
    const action = searchParams.get("action");

    const {user} = useAuth();
    const timeZone = user?.profile?.timezone || "UTC";
    
    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date as Date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));

    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({ startDate: week_start });

    const day_statuses = daily_logs.map(log => {
        return format(log.date, "yyyy-MM-dd", {in: tz(timeZone) })
    });

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 xl:grid-cols-5">
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-2">
                    <QuickActionsCard date={selected_date} openAction={action} />
                    <CheckInCard date={selected_date} />
                    <SingleWeekPicker
                        value={selected_date}
                        onChange={(date, start_week, end_week) => {
                            setSelectedDate(date);
                            setWeekStart(start_week);
                            setWeekEnd(end_week);
                        }}
                        weekStartsOn={0}
                        day_statuses={day_statuses}
                    />
                    <DailyCheckInSummaryCard date={selected_date} />
                    <HungerEventsCard date={selected_date} />
                    <CravingEventsCard date={selected_date} />
                </div>
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-3">
                    <NutritionSummaryCard date={selected_date} />
                    <NutrientGapCard date={selected_date} />
                    <MealsCard
                        meal_type_name="breakfast"
                        date={selected_date}
                    />
                    <MealsCard
                        meal_type_name="lunch"
                        date={selected_date}
                    />
                    <MealsCard
                        meal_type_name="dinner"
                        date={selected_date}
                    />
                    <MealsCard
                        meal_type_name="snack"
                        date={selected_date}
                    />
                </div>
            </div>
        </>

    );
}
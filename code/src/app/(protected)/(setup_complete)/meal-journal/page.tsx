"use client";

import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { endOfWeek, startOfWeek } from "date-fns";

import React from "react";
import SearchFoodCard from "@/components/cards/search_food_card";
import { CheckInCard } from "@/components/cards/check_in_card";
import JournalMealCard from "@/components/cards/journal_meal_cards/journal_meal_card";

export default function CalorieCalculatorPage() {
    // States for week picker
    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));

    // Used to get status for a specific day in the week picker
    const { data: day_status_data = [], isLoading: loading_day_statuses } = useDailyLogStatus({
        startDate: week_start,
        endDate: week_end,
        status: "daily_checkins",
    });
    const day_status_array = day_status_data.map(status => status.date);

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <SingleWeekPicker
                        value={selected_date}
                        onChange={(date, start_week, end_week) => {
                            setSelectedDate(date);
                            setWeekStart(start_week);
                            setWeekEnd(end_week);
                        }}
                        weekStartsOn={0}
                        day_statuses={day_status_array}
                    />
                    <CheckInCard date={selected_date} />
                </div>
                <div className="col-span-2">
                    <NutritionSummaryCard date={selected_date} />
                </div>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <SearchFoodCard date={selected_date} />
                    <JournalMealCard date={selected_date} />
                </div>
            </div>
        </>
    );
}
"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { useCravingEvents, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/api-hooks/use-hunger-events";
import { NutrientGapCard } from "@/components/cards/nutrient_gap_card";
import { CheckInCard } from "@/components/cards/check_in_card";

export default function DailyLogPage() {
    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date as Date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));

    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({ startDate: week_start });
    
    const { data: meals = [], isLoading: meals_loading } = useMeals(selected_date);

    const day_statuses = daily_logs.map(log => {
        return format(log.date, "yyyy-MM-dd")
    });

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 xl:grid-cols-5">
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-2">
                    <QuickActionsCard date={selected_date} />
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
                    <DailyCheckInSummaryCard date={selected_date}/>
                    <HungerEventsCard date={selected_date}/>
                    <CravingEventsCard date={selected_date}/>
                </div>
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-3">
                    <NutritionSummaryCard date={selected_date} />
                    <NutrientGapCard date={selected_date} />
                    <MealsCard
                        title="Breakfast"
                        meals={meals.filter(meal => meal.meal_type === "breakfast")}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Lunch"
                        meals={meals.filter(meal => meal.meal_type === "lunch")}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Dinner"
                        meals={meals.filter(meal => meal.meal_type === "dinner")}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Snacks"
                        meals={meals.filter(meal => meal.meal_type === "snack")}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                </div>
            </div>
        </>

    );
}
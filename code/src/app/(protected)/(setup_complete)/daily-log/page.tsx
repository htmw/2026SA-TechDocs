"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, startOfWeek } from "date-fns";
import { useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { useCravingEvents, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/api-hooks/use-hunger-events";
import { useMeals } from "@/lib/hooks/api-hooks/use-meals";

export default function DailyLogPage() {
    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));

    const { data: day_status_data = [], isLoading: loading_day_statuses } = useDailyLogStatus({
        startDate: week_start,
        endDate: week_end,
        status: "daily_checkins",
    });
    const day_status_array = day_status_data.map(status => status.date);

    const { data: hunger_events = [], isLoading: loading_hunger } = useHungerEvents(selected_date);
    const { data: craving_events = [], isLoading: loading_craving } = useCravingEvents(selected_date);

    const delete_hunger = useDeleteHungerEvent();
    const delete_craving = useDeleteCravingEvent();

    const { data: meals = [], isLoading: meals_loading } = useMeals(selected_date);
    const total_calories = meals.reduce((total, meal) => total + meal.calories, 0);
    const total_protein = meals.reduce((total, meal) => total + meal.protein, 0);
    const total_fat = meals.reduce((total, meal) => total + meal.fat, 0);

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 xl:grid-cols-5">
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-2">
                    <QuickActionsCard date={selected_date} />
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
                    <DailyCheckInSummaryCard date={selected_date} />
                    <HungerEventsCard
                        onDelete={(date, id) => { delete_hunger.mutate({ date, id }) }}
                        events={hunger_events}
                    />

                    <CravingEventsCard
                        onDelete={(date, id) => { delete_craving.mutate({ date, id }) }}
                        events={craving_events}
                    />
                </div>
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-3">
                    <NutritionSummaryCard
                        total_calories={total_calories}
                        calorie_goal={2200}
                        total_protein={total_protein}
                        protein_goal={160}
                        total_fat={total_fat}
                        fat_goal={70}
                    />
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
"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard, MealSummary } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard, DailyCheckInSummaryCardProps } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, startOfWeek } from "date-fns";
import { useDailyLog, useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { useCravingEvents, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/api-hooks/use-hunger-events";
import { energy_rating, stress_level } from "@/lib/enums";

const breakfast: MealSummary[] = [
    {
        id: "1",
        name: "Everything Bagel",
        calories: 270,
        protein: 10,
        sodium: .53,
        fat: 2.5,
        vitamins: "Vitamin B6, Iron",
        serving: "1 bagel",
        logged_at: "8:15 AM",
    },
];

const lunch: MealSummary[] = [
    {
        id: "2",
        name: "Steak",
        calories: 857,
        protein: 93,
        sodium: 1.269,
        fat: 51,
        vitamins: "Vitamin B12, Iron, Zinc",
        serving: "1 steak",
        logged_at: "1:10 PM",
    },
    {
        id: "3",
        name: "Mash Potatoes",
        calories: 300,
        protein: 20,
        sodium: 20,
        fat: 30,
        vitamins: "Vitamin C, Potassium",
        serving: "1/2 lb",
        logged_at: "1:10 PM",
    },
];

const snacks: MealSummary[] = [
    {
        id: "4",
        name: "Vanilla Ice Cream",
        calories: 145,
        protein: 2.5,
        sodium: .058,
        fat: 8,
        serving: "1/2 cup",
        logged_at: "4:45 PM",
    },
];

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
                        total_calories={1500}
                        calorie_goal={2200}
                        total_protein={150}
                        protein_goal={160}
                        total_fat={30}
                        fat_goal={70}
                    />
                    <MealsCard
                        title="Breakfast"
                        meals={breakfast}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Lunch"
                        meals={lunch}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Dinner"
                        meals={[]}
                        onAddMeal={() => {
                            console.log("Add meal clicked");
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Snacks"
                        meals={snacks}
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
"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard, MealSummary } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard, DailyCheckInSummaryCardProps } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useCravingEvents, useCreateCravingEvent, useCreateDailyLog, useCreateHungerEvent, useDailyLog, useDailyLogs, useDeleteCravingEvent, useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/useDailyLog";
import { craving_intensity_enum, craving_triggers_enum, craving_type_enum, energy_rating_label_map, hunger_level_enum, stress_level_label_map } from "@/lib/zod_schemas/health_schema";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { tz } from "@date-fns/tz";

const breakfast: MealSummary[] = [
    {
        id: "1",
        name: "Everything Bagel",
        calories: 270,
        protein: 10,
        sodium: .53,
        fat: 2.5,
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

async function generateRandomCheckin(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd")
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
        date: formatted_date,
        event: {
            occurred_at: formatted_date,
            craving_type: randomFrom(craving_type_enum),
            intensity: randomFrom(craving_intensity_enum),
            trigger: randomFrom(craving_triggers_enum),
            suggested_actions: [
                "Drink a glass of water",
                "Take a 5-minute walk",
                "Try a healthy snack",
            ],
            reasoning: "Random auto-generated craving event for testing",
        },
    };
}

async function generateRandomCravingEvent(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd", {in: tz('America/New_York'),})
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
        date: formatted_date,
        event: {
            occurred_at: new Date().toISOString(),
            craving_type: randomFrom(craving_type_enum),
            intensity: randomFrom(craving_intensity_enum),
            trigger: randomFrom(craving_triggers_enum),
            suggested_actions: [
                "Some snack 1",
                "Some action 2",
                "Some action 3",
            ],
            reasoning: "Some type of reasoning",
        },
    };
}

async function generateRandomHungerEvent(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd", {in: tz('America/New_York'),})
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];

    return {
        date: formatted_date,
        event: {
            occurred_at: new Date().toISOString(),
            hunger_level: randomFrom(hunger_level_enum),
            suggested_actions: [
                "Some recipe 1",
                "Some action 2",
                "Some action 3",
            ],
            reasoning: "Some type of reasoning",
        },
    };
}

async function generateRandomDailyLog() {
    const formatted_date = format(new Date(), "yyyy-MM-dd", {in: tz('America/New_York'),})
    console.log(formatted_date);
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
        date: new Date().toISOString(),
        morning_weight: Math.floor(Math.random() * 40 + 200),
        energy_rating: randomFrom(Object.keys(energy_rating_label_map)),
        sleep_hours: Math.floor(Math.random() * 4 + 6),
        stress_level: randomFrom(Object.keys(stress_level_label_map)),
        timezone: "America/New_York",
    };
}

export default function DailyLogPage() {
    const createCraving = useCreateCravingEvent();
    const createHunger = useCreateHungerEvent();
    const createDailyLog = useCreateDailyLog();

    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));
    const { data: hunger_events = [], isLoading: loading_hunger } = useHungerEvents(selected_date);
    const { data: craving_events = [], isLoading: loading_craving } = useCravingEvents(selected_date);
    const delete_hunger = useDeleteHungerEvent();
    const delete_craving = useDeleteCravingEvent();

    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs(week_start, week_end);
    const { data: daily_log } = useDailyLog(selected_date);

    const day_statuses = daily_logs.map(log => {
        return format(log.date, "yyyy-MM-dd")
    });

    const check_in_opts: DailyCheckInSummaryCardProps | undefined = daily_log ? {
        morning_weight: daily_log.morning_weight,
        energy_rating: energy_rating_label_map[daily_log.energy_rating],
        sleep_hours: daily_log.sleep_hours,
        stress_level: stress_level_label_map[daily_log.stress_level]
    } as DailyCheckInSummaryCardProps : undefined;

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 xl:grid-cols-5">
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-2">
                    <QuickActionsCard
                        onCraving={async () => {
                            createCraving.mutate(await generateRandomCravingEvent(selected_date))
                        }}
                        onHungry={async () => { 
                            createHunger.mutate(await generateRandomHungerEvent(selected_date))}}
                        onCheckIn={async () => {
                            createDailyLog.mutate(await generateRandomDailyLog());
                        }}
                    />
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
                    <DailyCheckInSummaryCard
                        check_in_opts={check_in_opts}
                    />
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
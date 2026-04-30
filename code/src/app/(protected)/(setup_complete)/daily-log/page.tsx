"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard, MealSummary } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard, DailyCheckInSummaryCardProps } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useCreateDailyLog, useDailyLog, useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { useCravingEvents, useCreateCravingEvent, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useCreateHungerEvent, useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/api-hooks/use-hunger-events";
import { useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { NutrientGapCard } from "@/components/cards/nutrient_gap_card";
import { analyzeNutrientGaps, calculateDietaryGuidelines } from "@/lib/utils/nutrition_utils";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";
import { energy_rating } from "@/lib/enums";

const breakfast: MealSummary[] = [
    {
        id: "1",
        name: "Everything Bagel",
        calories: 270,
        protein: 10,
        carbs: 55,
        sodium: .53,
        fat: 2.5,
        vitamins: "Vitamin B6, Iron",
        minerals: "Calcium",
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
        carbs: 0,
        sodium: 1.269,
        fat: 51,
        vitamins: "Vitamin B12, Iron, Zinc",
        minerals: "Selenium",
        serving: "1 steak",
        logged_at: "1:10 PM",
    },
    {
        id: "3",
        name: "Mash Potatoes",
        calories: 300,
        protein: 20,
        carbs: 65,
        sodium: 20,
        fat: 30,
        vitamins: "Vitamin C, Potassium",
        minerals: "Magnesium",
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
        carbs: 20,
        sodium: .058,
        fat: 8,
        minerals: "Calcium",
        serving: "1/2 cup",
        logged_at: "4:45 PM",
    },
];

export default function DailyLogPage() {
    const createCraving = useCreateCravingEvent();
    const createHunger = useCreateHungerEvent();
    const createDailyLog = useCreateDailyLog();

    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date as Date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));
    const { data: hunger_events = [], isLoading: loading_hunger } = useHungerEvents(selected_date);
    const { data: craving_events = [], isLoading: loading_craving } = useCravingEvents(selected_date);
    const delete_hunger = useDeleteHungerEvent();
    const delete_craving = useDeleteCravingEvent();

    const { user } = useAuth();
    const { data: meals = [], isLoading: meals_loading } = useMeals(selected_date);
    const total_calories = meals.reduce((total, meal) => total + meal.calories, 0);
    const total_protein = meals.reduce((total, meal) => total + meal.protein, 0);
    const total_fat = meals.reduce((total, meal) => total + meal.fat, 0);
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({ startDate: week_start });
    const { data: daily_log } = useDailyLog(selected_date);

    const day_statuses = daily_logs.map(log => {
        return format(log.date, "yyyy-MM-dd")
    });

    const check_in_opts: DailyCheckInSummaryCardProps | undefined = daily_log ? {
        morning_weight: daily_log.morning_weight,
        energy_rating: daily_log.energy_rating,
        sleep_hours: daily_log.sleep_hours,
        stress_level: daily_log.stress_level
    } as DailyCheckInSummaryCardProps : undefined;

    const combinedMeals: MealSummary[] = meals.map(m => ({
        id: m._id?.toString() || "",
        name: m.food_item,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        sodium: m.sodium,
        fat: m.fat,
        vitamins: m.vitamins?.join(", ") || "",
        minerals: m.minerals || "",
    }));

    const guidelines = calculateDietaryGuidelines(user?.profile, user?.profile.goals);
    const gaps = analyzeNutrientGaps(combinedMeals, guidelines);

    const totalCalculatedCals = total_calories;
    const totalCalculatedPro = total_protein;
    const totalCalculatedFat = total_fat;

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
                        day_statuses={day_statuses}
                    />
                    <DailyCheckInSummaryCard
                        date={selected_date}
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
                        total_calories={totalCalculatedCals}
                        calorie_goal={guidelines.calories}
                        total_protein={totalCalculatedPro}
                        protein_goal={guidelines.protein}
                        total_fat={totalCalculatedFat}
                        fat_goal={guidelines.fat}
                    />
                    <NutrientGapCard gaps={gaps} />
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
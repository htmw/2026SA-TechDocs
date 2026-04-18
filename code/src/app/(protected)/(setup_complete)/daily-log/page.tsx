"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { MealsCard, MealSummary } from "@/components/cards/meals_card";
import * as React from "react";
import { DailyCheckInSummaryCard, DailyCheckInSummaryCardProps } from "@/components/cards/check_in_summary_card";
import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { CravingEventsCard, HungerEventsCard } from "@/components/cards/events_card";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { craving_intensity, craving_triggers, craving_type, energy_rating, hunger_level, stress_level } from "@/lib/enums";
import { QuickActionsCard } from "@/components/cards/quick_actions_card";
import { useCravingEvents, useCreateCravingEvent, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useHungerEvents, useCreateHungerEvent, useDeleteHungerEvent } from "@/lib/hooks/api-hooks/use-hunger-events";
import { useCreateDailyLog, useDailyLog, useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log";
import { useMeals, useDeleteMeal } from "@/lib/hooks/api-hooks/use-meals";
import { NutrientGapCard } from "@/components/cards/nutrient_gap_card";
import { analyzeNutrientGaps, calculateDietaryGuidelines } from "@/lib/utils/nutrition_utils";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchFoodCard from "@/components/cards/search_food_card";
import { tz } from "@date-fns/tz";


async function generateRandomCravingEvent(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd", { in: tz('America/New_York'), })
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
        date: formatted_date,
        event: {
            occurred_at: new Date().toISOString(),
            craving_type: randomFrom(craving_type.values),
            intensity: randomFrom(craving_intensity.values),
            trigger: randomFrom(craving_triggers.values),
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
    const formatted_date = format(date, "yyyy-MM-dd", { in: tz('America/New_York'), })
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];

    return {
        date: formatted_date,
        event: {
            occurred_at: new Date().toISOString(),
            hunger_level: randomFrom(hunger_level.values),
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
    const formatted_date = format(new Date(), "yyyy-MM-dd", { in: tz('America/New_York'), })
    console.log(formatted_date);
    const randomFrom = (arr: readonly any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
        date: new Date().toISOString(),
        morning_weight: Math.floor(Math.random() * 40 + 200),
        energy_rating: randomFrom(energy_rating.values),
        sleep_hours: Math.floor(Math.random() * 4 + 6),
        stress_level: randomFrom(stress_level.values),
        timezone: "America/New_York",
    };
}

export default function DailyLogPage() {
    const { user } = useAuth();
    const createCraving = useCreateCravingEvent();
    const createHunger = useCreateHungerEvent();
    const createDailyLog = useCreateDailyLog();

    const [selected_date, setSelectedDate] = React.useState(new Date());
    const [isAddMealModalOpen, setIsAddMealModalOpen] = React.useState(false);
    const [activeMealType, setActiveMealType] = React.useState<string>('');
    const [defaultSearchTerm, setDefaultSearchTerm] = React.useState<string>('');
    const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date, { weekStartsOn: 0 }));
    const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));
    const formatted_selected_date = format(selected_date, "yyyy-MM-dd", { in: tz(user?.profile?.timezone || 'America/New_York') });
    const { data: hunger_events = [], isLoading: loading_hunger } = useHungerEvents(formatted_selected_date);
    const { data: craving_events = [], isLoading: loading_craving } = useCravingEvents(formatted_selected_date);
    const delete_hunger = useDeleteHungerEvent();
    const delete_craving = useDeleteCravingEvent();

    const delete_meal = useDeleteMeal();

    const { data: meals = [], isLoading: meals_loading } = useMeals(formatted_selected_date);
    const total_calories = meals.reduce((total, meal) => total + meal.calories, 0);
    const total_protein = meals.reduce((total, meal) => total + meal.protein, 0);
    const total_fat = meals.reduce((total, meal) => total + meal.fat, 0);
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({ startDate: week_start, endDate: week_end });

    const day_statuses = daily_logs.map(log => {
        return format(log.date, "yyyy-MM-dd")
    });

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
    const guidelines = calculateDietaryGuidelines(user?.profile, user?.profile?.goals);
    const gaps = analyzeNutrientGaps(combinedMeals, guidelines);

    const totalCalculatedCals = total_calories;
    const totalCalculatedPro = total_protein;
    const totalCalculatedFat = total_fat;

    const handleAcceptAction = (action: string) => {
        setDefaultSearchTerm(action);
        setActiveMealType("snack"); // Default to snack for craving/hunger events
        setIsAddMealModalOpen(true);
    };

    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1 xl:grid-cols-5">
                <div className="flex flex-col justify-items-center place-items-center gap-5 xl:col-span-2">
                    <QuickActionsCard
                        date={selected_date}
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
                        date={selected_date}
                    />
                    <HungerEventsCard
                        onDelete={(date, id) => { delete_hunger.mutate({ date, id }) }}
                        onAcceptAction={handleAcceptAction}
                        events={hunger_events}
                    />

                    <CravingEventsCard
                        onDelete={(date, id) => { delete_craving.mutate({ date, id }) }}
                        onAcceptAction={handleAcceptAction}
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
                        meals={meals.filter(m => m.meal_type === "breakfast")}
                        onAddMeal={() => {
                            setDefaultSearchTerm("");
                            setActiveMealType("breakfast");
                            setIsAddMealModalOpen(true);
                        }}
                        onDeleteMeal={(meal) => {
                            delete_meal.mutate({ date: formatted_selected_date, id: meal._id?.toString() || "" });
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Lunch"
                        meals={meals.filter(m => m.meal_type === "lunch")}
                        onAddMeal={() => {
                            setDefaultSearchTerm("");
                            setActiveMealType("lunch");
                            setIsAddMealModalOpen(true);
                        }}
                        onDeleteMeal={(meal) => {
                            delete_meal.mutate({ date: formatted_selected_date, id: meal._id?.toString() || "" });
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Dinner"
                        meals={meals.filter(m => m.meal_type === "dinner")}
                        onAddMeal={() => {
                            setDefaultSearchTerm("");
                            setActiveMealType("dinner");
                            setIsAddMealModalOpen(true);
                        }}
                        onDeleteMeal={(meal) => {
                            delete_meal.mutate({ date: formatted_selected_date, id: meal._id?.toString() || "" });
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                    <MealsCard
                        title="Snacks"
                        meals={meals.filter(m => m.meal_type === "snack")}
                        onAddMeal={() => {
                            setDefaultSearchTerm("");
                            setActiveMealType("snack");
                            setIsAddMealModalOpen(true);
                        }}
                        onDeleteMeal={(meal) => {
                            delete_meal.mutate({ date: formatted_selected_date, id: meal._id?.toString() || "" });
                        }}
                        onMealClick={(meal) => {
                            console.log("Open meal details:", meal);
                        }}
                    />
                </div>
            </div>

            <Dialog open={isAddMealModalOpen} onOpenChange={setIsAddMealModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="capitalize">Add {activeMealType}</DialogTitle>
                    </DialogHeader>
                    {activeMealType && (
                        <SearchFoodCard 
                            date={selected_date} 
                            defaultMealType={activeMealType} 
                            defaultSearchTerm={defaultSearchTerm}
                            onSuccess={() => {
                                setIsAddMealModalOpen(false);
                                setDefaultSearchTerm("");
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>

    );
}
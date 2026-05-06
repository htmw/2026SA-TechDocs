"use client";

import { NutritionSummaryCard } from "@/components/cards/macro_card";
import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { meal_type, MealType } from "@/lib/enums";
import { useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { useFoods } from "@/lib/hooks/api-hooks/use-food";
import { useCreateMeal, useDeleteMeal, useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { IFood } from "@/lib/types/mongo_food_types";
import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { tz } from "@date-fns/tz";
import { endOfWeek, format, startOfWeek } from "date-fns";
import MealCard from "@/components/cards/meal_card";

import React, { use, useEffect, useState } from "react";
import SearchFoodCard from "@/components/cards/search_food_card";

export default function CalorieCalculatorPage() {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    // API hook to create a meal
    /**
     * Example request body
     * {
     *   "date": format(selected_date, "yyyy-MM-dd", { in: tz(timezone), }),
     *   "meal": {
     *          "meal_type": "breakfast",
     *          "food_item": "Scrambled Eggs",
     *          "calories": 180,
     *          "protein": 12,
     *          "carbohydrates": 2,
     *          "fat": 14,
     *          "fiber": 0,
     *          "sugar": 1,
     *          "sodium": 180,
     *          "cholesterol": 370,
     *          "water_intake": 250,
     *          "serving_quantity": 2,
     *          "servings": 3,
     *          "logged_at": "2026-03-28T21:40:24.724Z"
     *   }
     * }
     * 
     * create_meal.mutate(body);
     * NOTE: User needs to checkin before they can log meals
     * 
     */

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

    const { data: meals = [], isLoading: meals_loading } = useMeals(selected_date);

    /**
     * Usage Example:
     * delete_meal.mutate({ date, meal_id }, { 
     *      onSuccess: () => console.log("Meal deleted successfully"), // refresh meals or remove the meal from local state
     *      onError: (err) => console.error("Failed to delete meal", err) 
     * })
     */
    const delete_meal = useDeleteMeal();

    const formatted_selected_date = format(selected_date, "yyyy-MM-dd", { in: tz(timezone), });

    const mealsByType = {
        breakfast: meals.filter(m => m.meal_type === 'breakfast'),
        lunch: meals.filter(m => m.meal_type === 'lunch'),
        dinner: meals.filter(m => m.meal_type === 'dinner'),
        snack: meals.filter(m => m.meal_type === 'snack'),
    };
    
    return (
        <>
            <div className="gap-5 p-6 grid grid-cols-1">
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
                <NutritionSummaryCard date={selected_date} />
                <SearchFoodCard date={selected_date} />
                {meal_type.entries.map(([label, value]) => (
                    <div key={label}>
                        <h3 className="capitalize 2xl:text-xl font-bold">{value}</h3>
                        {mealsByType[label].length === 0
                            ? <p className="text-muted-foreground text-sm">Nothing logged yet.</p>
                            : mealsByType[label].map(meal => (
                                <MealCard
                                    key={meal._id}
                                    meal={meal}
                                    onDelete={() => delete_meal.mutate({ date: formatted_selected_date, id: meal._id })}
                                />
                            ))
                        }
                    </div>
                ))}
            </div>
        </>
    );
}
"use client";

import { SingleWeekPicker } from "@/components/cards/single_week_picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { useFoods } from "@/lib/hooks/api-hooks/use-food";
import { useCreateMeal, useDeleteMeal, useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";
import { endOfWeek, format, startOfWeek } from "date-fns";
import React, { useEffect, useState } from "react";

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
    const create_meal = useCreateMeal();

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

    // Example usage of useFoods hook with various parameters
    // Uncomment paramters as needed
    // The current example get the lowest calorie steak with at least 30g of protein
    const { data: suggestedFoods = [] } = useFoods({
        limit: 5,
        sort_field: "calories",
        sort_dir: "asc",
        food_item_contains: "Steak",
        // category : "Grain", //custom field
        // calories_lt : 500,
        // sodium_lt: 100 // doesn't exist in UseFoodsParams, but you can add custom parameters if needed
        protein_gte: 30
    });

    const formatted_selected_date = format(selected_date, "yyyy-MM-dd", { in: tz(timezone), });

    const [search_input, setSearchInput] = useState("");
    const [debounced_search, setDebouncedSearch] = useState("");

    const { data: foods = [] } = useFoods({
        limit: 5,
        sort_field: "calories",
        sort_dir: "asc",
        food_item_contains: "Steak",
        // category : "Grain", //custom field
        // calories_lt : 500,
        // sodium_lt: 100 // doesn't exist in UseFoodsParams, but you can add custom parameters if needed
        protein_gte: 30
    });

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search_input), 300);
        return () => clearTimeout(timeout);
    }, [search_input]);

    const { data } = useFoods({
        food_item_contains: debounced_search,
        limit: 10,
    });

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
                <Card className="p-4">
                    <h1 className="text-lg font-bold mb-4">Selected Date: {formatted_selected_date}</h1>
                    <Input className="w-lg mt-2"
                        placeholder="Add a food or meal to your daily log. Try searching for 'steak' or 'salad'..."
                        value={search_input}
                        onChange={e => setSearchInput(e.target.value)}
                        /> 
                </Card>

                {data?.foods?.map((food) => (
                    <Button key={food._id} variant="outline" className="w-full justify-start" onClick={() => {
                        create_meal.mutate(
                            {
                                date: formatted_selected_date,
                                meal: {
                                    meal_type: "dinner",
                                    food_item: food.food_item,
                                    calories: food.calories,
                                    protein: food.protein,
                                    carbohydrates: food.carbohydrates,
                                    fat: food.fat,
                                    fiber: food.fiber,
                                    sugar: food.sugars,
                                    sodium: food.sodium,
                                    cholesterol: food.cholesterol,
                                    water_intake: food.water_intake,
                                    servings: 1,
                                    logged_at: new Date().toISOString(),
                                }
                            });
                    }}>{food.food_item} <span className="text-muted-foreground">({food.calories} cal)</span></Button>

                ))}
                
                <Button onClick={() => {
                    //NOTE: User needs to checkin before they can log meals
                    create_meal.mutate(
                        {
                            date: formatted_selected_date,
                            meal: {
                                meal_type: "dinner",
                                food_item: "Grilled Chicken Salad",
                                calories: 350,
                                protein: 30,
                                carbohydrates: 10,
                                fat: 20,
                                fiber: 5,
                                sugar: 5,
                                sodium: 400,
                                cholesterol: 75,
                                water_intake: 300,
                                servings: 1,
                                logged_at: new Date().toISOString(),
                            }
                        });
                }}>Add Meal For Selected Date</Button>
                
                <Button onClick={() => {
                    //NOTE: User needs to checkin before they can log meals
                    if (meals.length === 0) return;
                    delete_meal.mutate({
                        date: formatted_selected_date,
                        id: meals[meals.length - 1]?._id || "", // Replace with actual meal ID to delete
                    });
                }}>Delete Selected Dates Last Meal</Button>

                <h1 className="font-bold">NOTE: User needs to check in before they can log meals</h1>
                <h1 className="font-bold">
                    Check in status for selected date {formatted_selected_date}: 
                    {day_status_array.includes(formatted_selected_date) ? 
                    <p className="text-green-500">Checked in</p> :
                    <p className="text-red-500">Not checked in</p>}
                </h1>

                <h1 className="font-bold">Meals</h1>
                <pre>{JSON.stringify(meals, null, 2)}</pre>
                ---
                <h1 className="font-bold">Foods</h1>
                <pre>{JSON.stringify(foods, null, 2)}</pre>
            </div>
        </>
    );
}
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useFoods } from "@/lib/hooks/api-hooks/use-food";
import { useCreateMeal } from "@/lib/hooks/api-hooks/use-meals";
import { ClientFood, IFood } from "@/lib/types/mongo_food_types";
import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { MealType } from "@/lib/enums";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";
import { format } from "date-fns";

export default function SearchFoodCard({
    date,
    defaultMealType,
    defaultSearchTerm,
    onSuccess,
}: {
    date: Date;
    defaultMealType?: string;
    defaultSearchTerm?: string;
    onSuccess?: () => void;
}) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";
    
    const [search_input, setSearchInput] = useState(defaultSearchTerm || "");
    const [debounced_search, setDebouncedSearch] = useState(defaultSearchTerm || "");

    const formatted_selected_date = format(date, "yyyy-MM-dd", { in: tz(timezone), });

    const create_meal = useCreateMeal();

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search_input), 300);
        return () => clearTimeout(timeout);
    }, [search_input]);

    const { data: foods } = useFoods({
        food_item_contains: debounced_search,
        limit: 10,
    });
    const [search, setSearch] = useState(!!defaultSearchTerm);
    const [add, setAdd] = useState(defaultMealType || ''); // breakfast, lunch, dinner

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(true);
        setSearchInput(e.target.value)
    }


    function handleFoodSelect(food: ClientFood) {
        create_meal.mutate({
            date: formatted_selected_date,
            meal: {
                meal_type: add as MealType,
                food_item: food.food_item,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbohydrates,
                carbohydrates: food.carbohydrates,
                fat: food.fat,
                fiber: food.fiber,
                sugar: food.sugar,
                sodium: food.sodium,
                cholesterol: food.cholesterol,
                water_intake: food.water_intake,
                servings: 1,
                logged_at: new Date().toISOString(),
            }
        })
        setSearch(false);
        setSearchInput("");
        setAdd(defaultMealType || '');
        if (onSuccess) {
            onSuccess();
        }
    }
    return (
        <>
            <Card className="p-4">
                {!defaultMealType && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setAdd('breakfast')}
                        >
                            Add Breakfast
                        </Button>
    
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setAdd('lunch')}
                        >
                            Add Lunch
                        </Button>
    
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setAdd('dinner')}
                        >
                            Add Dinner
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setAdd('snack')}
                        >
                            Add Snack
                        </Button>
                    </div>
                )}
                {add != '' && (
                    <Input className="w-lg mt-2 sm:w-lg mx-auto block"
                        placeholder={`Add a ${add} item to your daily log. Try searching for 'steak' or 'salad'...`}
                        value={search_input}
                        onChange={e => handleSearch(e)}
                    />
                )}

            </Card>
            {search && (
                <>
                    {foods?.foods?.map((food) => (
                        <Button key={food._id} variant="outline" className="w-full justify-start" onClick={() => {
                            handleFoodSelect(food);
                        }}>
                            {food.food_item}
                            <span className="text-muted-foreground">({food.calories} cal)</span>
                            <span className="text-orange-300">{food.protein}g protein</span>
                            <span className="text-green-300">{food.carbohydrates}g carbs</span>
                            <span className="text-yellow-300">{food.fat}g fat</span>
                        </Button>
                    ))}
                </>
            )}
        </>
    )
}
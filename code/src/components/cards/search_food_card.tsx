import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useFoods } from "@/lib/hooks/api-hooks/use-food";
import { useRecipes } from "@/lib/hooks/api-hooks/use-recipe";
import { useCreateMeal } from "@/lib/hooks/api-hooks/use-meals";
import { ClientFood } from "@/lib/types/mongo_food_types";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { MealType } from "@/lib/enums";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";
import { format } from "date-fns";

export default function SearchFoodCard({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    const [search_input, setSearchInput] = useState("");
    const [debounced_search, setDebouncedSearch] = useState("");
    const [search, setSearch] = useState(false);
    const [add, setAdd] = useState("");

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

    const { data: recipes } = useRecipes({
        title_contains: debounced_search,
        limit: 10,
    });

    const foodList = foods?.foods ?? [];
    const recipeList = recipes?.recipes ?? [];

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(true);
        setSearchInput(e.target.value);
    }


    function handleFoodSelect(food: ClientFood) {
        const carbsValue = food.carbohydrates ?? 0;

        create_meal.mutate({
            date: formatted_selected_date,
            meal: {
                meal_type: add as MealType,
                food_item: food.food_item,
                calories: food.calories,
                protein: food.protein,
                carbohydrates: carbsValue,
                carbs: carbsValue,
                fat: food.fat,
                fiber: food.fiber,
                sugar: food.sugar,
                sodium: food.sodium,
                cholesterol: food.cholesterol,
                water_intake: food.water_intake,
                servings: 1,
                logged_at: new Date().toISOString(),
            }
        });

        reset();
    }

    function handleRecipeSelect(recipe: ClientRecipes) {
        create_meal.mutate({
            date: formatted_selected_date,
            meal: {
                meal_type: add as MealType,
                food_item: recipe.title,
                calories: recipe.calories,
                protein: recipe.protein,
                carbohydrates: 0,
                carbs: 0,
                fat: recipe.fat,
                fiber: 0,
                sugar: 0,
                sodium: recipe.sodium,
                cholesterol: 0,
                water_intake: 0,
                servings: 1,
                logged_at: new Date().toISOString(),
            }
        });

        reset();
    }

    function reset() {
        setSearch(false);
        setSearchInput("");
        setDebouncedSearch("");
        setAdd("");
    }
    return (
        <>
            <Card className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setAdd("breakfast")}
                    >
                        Add Breakfast
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setAdd("lunch")}
                    >
                        Add Lunch
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setAdd("dinner")}
                    >
                        Add Dinner
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setAdd("snack")}
                    >
                        Add Snack
                    </Button>
                </div>

                {add !== "" && (
                    <Input
                        className="w-lg mt-2 sm:w-lg mx-auto block"
                        placeholder={`Add a ${add} item to your daily log. Try searching for 'steak' or 'salad'...`}
                        value={search_input}
                        onChange={handleSearch}
                    />
                )}

            </Card>
            {search && (
                <>
                    {foodList.length > 0 && (
                        <>
                            <p className="text-xs px-2 mt-2">Foods</p>

                            {foodList.map((food) => (
                                <Button key={food._id} variant="outline" className="w-full justify-start" onClick={() =>
                                        handleFoodSelect(food)}
                                >
                                    {food.food_item}
                                    <span className="text-muted-foreground">({food.calories} cal)</span>
                                    <span className="text-orange-300">{food.protein}g protein</span>
                                    <span className="text-green-300">{food.carbohydrates ?? 0}g carbs</span>
                                    <span className="text-yellow-300">{food.fat}g fat</span>
                                </Button>
                            ))}
                        </>
                    )}

                    {foodList.length === 0 && recipeList.length > 0 && (
                        <>
                            <p className="text-xs px-2 mt-2">Recipes</p>

                            {recipeList.map((recipe) => (
                                <Button
                                    key={recipe._id}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleRecipeSelect(recipe)}
                                >
                                    {recipe.title}
                                    <span className="text-muted-foreground">({recipe.calories} cal)</span>
                                    <span className="text-orange-300">{recipe.protein}g protein</span>
                                    <span className="text-green-300">0g carbs</span>
                                    <span className="text-yellow-300">{recipe.fat}g fat</span>
                                </Button>
                            ))}
                        </>
                    )}

                    {foodList.length === 0 && recipeList.length === 0 && (
                        <p className="text-sm px-2">No food or recipe results found</p>
                    )}
                </>
            )}
        </>
    )
}
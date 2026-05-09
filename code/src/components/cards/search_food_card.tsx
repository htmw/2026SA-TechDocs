import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useFoods } from "@/lib/hooks/api-hooks/use-food";
import { useRecipes } from "@/lib/hooks/api-hooks/use-recipe";
import { useCreateMeal } from "@/lib/hooks/api-hooks/use-meals";
import { ClientFood } from "@/lib/types/mongo_food_types";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { meal_type, MealType } from "@/lib/enums";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export function FoodItem<T extends ClientFood | ClientRecipes>({
    item, handleSelection
}: {
    item: T;
    handleSelection: (item: T) => void
}) {
    const title = "food_item" in item ? item.food_item : item.title;
    const carbohydrates = "carbohydrates" in item ? item.carbohydrates : 0;

    return <Button
        key={item._id}
        variant="outline"
        className="w-full justify-start h-[4rem]"
        onClick={() => handleSelection(item)}
    >
        <div className="flex flex-col text-left">
            <div>
                {title}
            </div>
            <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground">({item.calories} cal)</span>
                <span className="text-orange-300">{item.protein}g protein</span>
                <span className="text-green-300">{carbohydrates}g carbs</span>
                <span className="text-yellow-300">{item.fat}g fat</span>
            </div>
        </div>
    </Button>
}


export default function SearchFoodCard({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    const [search_input, setSearchInput] = useState("");
    const [debounced_search, setDebouncedSearch] = useState("");
    const [add, setAdd] = useState<MealType>("breakfast");

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
        setSearchInput(e.target.value);
    }

    function handleFoodSelect(food: ClientFood) {
        create_meal.mutate({
            date: formatted_selected_date,
            meal: {
                meal_type: add as MealType,
                food_item: food.food_item,
                calories: food.calories,
                protein: food.protein,
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
        setSearchInput("");
        setDebouncedSearch("");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Search Foods & Recipes</CardTitle>
                <CardDescription>Find and add foods or recipes to your daily log.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <h1 className="text-md font-semibold">Meal Type</h1>
                <div className="flex flex-col 2xl:flex-row gap-2 justify-start mb-3">
                    {meal_type.entries.map(([value, label]) => (
                        <Button
                            key={value}
                            variant={add === value ? "secondary" : "outline"}
                            size="sm"
                            className="min-w-[8rem]"
                            onClick={() => setAdd(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <Separator />
                <h1 className="text-md font-semibold">Search</h1>
                <Input
                    className="mx-auto mb-3"
                    placeholder={`Try searching for 'steak' or 'salad'...`}
                    value={search_input}
                    onChange={handleSearch}
                />
                <Separator />

                <h1 className="text-md font-semibold">Results</h1>
                <ScrollArea className="h-[24rem] pr-3">
                    {foodList.length === 0 && recipeList.length === 0 && (
                        <div className="text-center text-muted-foreground mt-4">
                            No results found. Try adjusting your search?
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        {foodList.map((food) => (
                            <FoodItem key={food._id} item={food} handleSelection={handleFoodSelect} />
                        ))}
                        {recipeList.map((recipe) => (
                            <FoodItem key={recipe._id} item={recipe} handleSelection={handleRecipeSelect} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
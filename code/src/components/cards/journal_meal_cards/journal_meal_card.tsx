import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { meal_type, MealType } from "@/lib/enums";
import { useDeleteMeal, useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { ClientMealLog } from "@/lib/types/mongo_daily_log_types";
import { tz } from "@date-fns/tz";
import { format } from "date-fns";
import { Trash } from "lucide-react";

function MealSection({
    meal,
    onDelete,
    deleting
}: {
    meal: ClientMealLog;
    onDelete: (id: string) => void
    deleting?: boolean
}) {
    return (
        <Card className="py-2">
            <CardContent className="w-full flex flex-col sm:flex-row items-center gap-5">
                <h1 className="font-bold text-lg">{meal.food_item}</h1>
                <span className="text-muted-foreground">({meal.calories} cal)</span>
                <span className="text-orange-300">{meal.protein}g protein</span>
                <span className="text-green-300">{meal.carbohydrates}g carbs</span>
                <span className="text-yellow-300">{meal.fat}g fat</span>
                <Button className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/30 bg-destructive/10 ml-auto" onClick={() => onDelete(meal._id)} disabled={deleting}>
                    {deleting ? (
                        <Spinner />
                    ) : (
                        <Trash />
                    )}
                </Button>
            </CardContent>
        </Card>
    )
};

export default function JournalMealCard({
    date
}: {
    date: Date
}) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    const { data: meals = [], isLoading: meals_loading } = useMeals(date);

    /**
     * Usage Example:
     * delete_meal.mutate({ date, meal_id }, { 
     *      onSuccess: () => console.log("Meal deleted successfully"), // refresh meals or remove the meal from local state
     *      onError: (err) => console.error("Failed to delete meal", err) 
     * })
     */
    const { mutate: delete_meal, isPending: delete_meal_pending } = useDeleteMeal();

    const formatted_selected_date = format(date, "yyyy-MM-dd", { in: tz(timezone), });

    const mealsByType = {
        breakfast: meals.filter(m => m.meal_type === 'breakfast'),
        lunch: meals.filter(m => m.meal_type === 'lunch'),
        dinner: meals.filter(m => m.meal_type === 'dinner'),
        snack: meals.filter(m => m.meal_type === 'snack'),
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Meals</CardTitle>
                <CardDescription>Review and manage your logged meals for the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {meal_type.entries.map(([label, value]) => (
                    <div key={label}>
                        <h3 className="2xl:text-xl font-bold mb-2">{value}</h3>
                        <div className="flex flex-col gap-2">
                            {mealsByType[label].length === 0
                                ? <p className="text-muted-foreground text-sm">Nothing logged yet.</p>
                                : mealsByType[label].map(meal => (
                                    <MealSection
                                        key={meal._id}
                                        meal={meal}
                                        onDelete={() => delete_meal({ date: formatted_selected_date, id: meal._id })}
                                        deleting={delete_meal_pending}
                                    />
                                ))
                            }</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
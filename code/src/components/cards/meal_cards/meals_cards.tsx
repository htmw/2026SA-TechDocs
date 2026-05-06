import { useDeleteMeal, useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { GenericMealsCard } from "./generic_meals_card";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { format } from "date-fns/format";
import { tz } from "@date-fns/tz";
import { meal_type, MealType } from "@/lib/enums";

export function MealsCard({
    meal_type_name,
    date
}: {
    meal_type_name: MealType,
    date: Date
}) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    const { data: meals = [], isLoading: meals_loading } = useMeals(date);
    const { isPending: isDeleting, mutate: delete_meal } = useDeleteMeal();
    const formatted_selected_date = format(date, "yyyy-MM-dd", { in: tz(timezone), });

    return (
        <GenericMealsCard
            title={meal_type.map[meal_type_name]}
            meals={meals.filter(meal => meal.meal_type === meal_type_name)}
            onDelete={(meal) => delete_meal({ date: formatted_selected_date, id: meal._id })}
            isDeleting={isDeleting}
        />
    );
}
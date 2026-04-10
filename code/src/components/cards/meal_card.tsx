import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IFood } from "@/lib/types/mongo_food_types";

function MealCard({ meal, onDelete }: { meal: IFood; onDelete: () => void }) {
  return (
    <Card className="w-full p-2 flex flex-col sm:flex-row items-center mt-4">
      <h1 className="font-bold text-lg">{meal.food_item}</h1>
      <span className="text-muted-foreground">({meal.calories} cal)</span>
      <span className="text-orange-300">{meal.protein}g protein</span>
      <span className="text-green-300">{meal.carbohydrates}g carbs</span>
      <span className="text-yellow-300">{meal.fat}g fat</span>
      <Button variant="destructive" className="sm:ml-auto" onClick={onDelete}>
        Delete
      </Button>
    </Card>
  );
}

export default MealCard;
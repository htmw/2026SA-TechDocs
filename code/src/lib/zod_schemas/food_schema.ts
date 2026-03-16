import { meal_type } from "@/lib/enums";
import z from "zod";

export const FoodZodSchema = z.object({
    food_item: z.string(),
    category: z.string(),
    meal_type: z.enum(meal_type.values, `Meal type is required (${meal_type.values.join(" | ")})`),
    calories: z.number().nonnegative("Calories must be a non-negative number"),
    protein: z.number().nonnegative("Protein must be a non-negative number"),
    carbohydrates: z.number().nonnegative("Carbohydrates must be a non-negative number"),
    fat: z.number().nonnegative("Fat must be a non-negative number"),
    fiber: z.number().nonnegative("Fiber must be a non-negative number"),
    sugars: z.number().nonnegative("Sugars must be a non-negative number"),
    sodium: z.number().nonnegative("Sodium must be a non-negative number"),
    cholesterol: z.number().nonnegative("Cholesterol must be a non-negative number"),
    water_intake: z.number().nonnegative("Water intake must be a non-negative number"),
});

export type FoodItem = z.infer<typeof FoodZodSchema>;
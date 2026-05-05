import z from "zod";

//A combination fo both food and recipe
//must convert food_item from food to name
export const NutritionSchema = z.object({
    name: z.string(), //food_item from Food, name from recipes
    calories: z.number().nonnegative("Calories must be a non-negative number"),
    protein: z.number().nonnegative("Protein must be a non-negative number"),
    carbohydrates: z.number().nonnegative("Carbohydrates must be a non-negative number").optional(),//FOOD ONLY
    fat: z.number().nonnegative("Fat must be a non-negative number"),
    fiber: z.number().nonnegative("Fiber must be a non-negative number").optional(),//FOOD ONLY
    sugars: z.number().nonnegative("Sugars must be a non-negative number").optional(),//FOOD ONLY
    sodium: z.number().nonnegative("Sodium must be a non-negative number"),
    cholesterol: z.number().nonnegative("Cholesterol must be a non-negative number").optional(),//FOOD ONLY
    water_intake: z.number().nonnegative("Water intake must be a non-negative number").optional(),//FOOD ONLY
    serving_quantity: z.number().nonnegative("Serving quantity must be a non-negative number").optional(),//FOOD ONLY
    serving_unit: z.string().optional(),//FOOD ONLY
    directions: z.array(z.string()).optional(),//RECIPE ONLY
    ingredients: z.array(z.string()).optional(),//RECIPE ONLY
});

export type NutritionItem = z.infer<typeof NutritionSchema>;
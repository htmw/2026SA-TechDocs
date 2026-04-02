import z from "zod";

export const FoodZodSchema = z.object({
    food_item: z.string(),
    categories: z.array(z.string()),
    calories: z.number().nonnegative("Calories must be a non-negative number"),
    protein: z.number().nonnegative("Protein must be a non-negative number"),
    carbohydrates: z.number().nonnegative("Carbohydrates must be a non-negative number"),
    fat: z.number().nonnegative("Fat must be a non-negative number"),
    fiber: z.number().nonnegative("Fiber must be a non-negative number"),
    sugars: z.number().nonnegative("Sugars must be a non-negative number"),
    sodium: z.number().nonnegative("Sodium must be a non-negative number"),
    cholesterol: z.number().nonnegative("Cholesterol must be a non-negative number"),
    water_intake: z.number().nonnegative("Water intake must be a non-negative number"),
    serving_quantity: z.number().nonnegative("Serving quantity must be a non-negative number"),
    serving_unit: z.string(),
});

export type FoodItem = z.infer<typeof FoodZodSchema>;
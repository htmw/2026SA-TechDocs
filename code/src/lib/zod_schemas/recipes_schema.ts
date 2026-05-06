import z from "zod";

export const RecipeZodSchema = z.object({
    categories: z.array(z.string()),
    directions: z.array(z.string()),
    ingredients: z.array(z.string()),
    calories: z.number().nonnegative("Calories must be a non-negative number"),
    fat: z.number().nonnegative("Fat must be a non-negative number"),
    protein: z.number().nonnegative("Protein must be a non-negative number"),
    sodium: z.number().nonnegative("Sodium must be a non-negative number"),
    title: z.string(),
});

export type Recipe = z.infer<typeof RecipeZodSchema>;
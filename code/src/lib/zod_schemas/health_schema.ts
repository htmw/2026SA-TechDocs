import { craving_intensity, craving_triggers, craving_type, energy_rating, food_type, hunger_level, meal_type, MealType, stress_level } from "@/lib/enums";
import z from "zod";
import { RecipeZodSchema } from "./recipes_schema";

export const DailyLogZodSchema = z.object({
    date: z.coerce.date(),
    timezone: z.string(),
    morning_weight: z.coerce.number().positive("Morning weight must be a positive number"),
    energy_rating: z.enum(energy_rating.values, `Energy rating is required (${energy_rating.values.join(" | ")})`),
    sleep_hours: z.coerce.number().min(0).max(24, "Sleep hours must be between 0 and 24"),
    stress_level: z.enum(stress_level.values, `Stress level is required (${stress_level.values.join(" | ")})`),
});

export const CravingPromptSchema = z.object({
    craving_prompt: z.string().min(1, "Craving prompt cannot be empty").max(1000, "Craving prompt cannot exceed 1000 characters"),
});

export const CravingEventSchema = z.object({
    occurred_at: z.coerce.date(),
    craving_prompt: z.string().min(1, "Craving prompt cannot be empty").max(1000, "Craving prompt cannot exceed 1000 characters"),
    recipe: RecipeZodSchema,
    suggested_actions: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
});

export const HungerEventZodSchema = z.object({
    occurred_at: z.coerce.date(),
    hunger_level: z.enum(hunger_level.values, `Hunger level is required (${hunger_level.values.join(" | ")})`),
    recipe: RecipeZodSchema,
    suggested_actions: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
});

export const MealZodSchema = z.object({
    meal_type: z.enum(meal_type.values, `Meal type is required (${meal_type.values.join(" | ")})`),
    food_item: z.string().min(2, "Food item must be at least 2 characters long").max(100, "Food item cannot exceed 100 characters"),
    calories: z.number().positive("Calories must be a positive number"),
    protein: z.number().min(0, "Protein cannot be negative"),
    carbohydrates: z.number().min(0, "Carbohydrates cannot be negative"),
    fat: z.number().min(0, "Fat cannot be negative"),
    fiber: z.number().min(0, "Fiber cannot be negative"),
    sugar: z.number().min(0, "Sugar cannot be negative"),
    sodium: z.number().min(0, "Sodium cannot be negative"),
    cholesterol: z.number().min(0, "Cholesterol cannot be negative"),
    water_intake: z.number().min(0, "Water intake cannot be negative"),
    servings: z.number().positive("Servings must be a positive number").optional(),
    logged_at: z.coerce.date(),
});

export type CravingPromptValues = z.infer<typeof CravingPromptSchema>;

export type DailyLogValues = z.infer<typeof DailyLogZodSchema>;

export type CravingEventValues = z.infer<typeof CravingEventSchema>;

export type HungerEventValues = z.infer<typeof HungerEventZodSchema>;
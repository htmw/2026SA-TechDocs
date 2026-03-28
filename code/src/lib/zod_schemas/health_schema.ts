import { craving_intensity, craving_triggers, craving_type, energy_rating, hunger_level, meal_type, MealType, stress_level } from "@/lib/enums";
import z from "zod";

export const DailyLogZodSchema = z.object({
    date: z.coerce.date(),
    timezone: z.string(),
    morning_weight: z.number().positive("Morning weight must be a positive number"),
    energy_rating: z.enum(energy_rating.values, `Energy rating is required (${energy_rating.values.join(" | ")})`),
    sleep_hours: z.number().min(0).max(24, "Sleep hours must be between 0 and 24"),
    stress_level: z.enum(stress_level.values, `Stress level is required (${stress_level.values.join(" | ")})`),
});

export const CravingEventSchema = z.object({
    occurred_at: z.coerce.date(),
    craving_type: z.enum(craving_type.values, `Craving type is required (${craving_type.values.join(" | ")})`),
    intensity: z.enum(craving_intensity.values, `Intensity is required (${craving_intensity.values.join(" | ")})`),
    trigger: z.enum(craving_triggers.values, `Trigger is required (${craving_triggers.values.join(" | ")})`),
    suggested_actions: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
});

export const HungerEventZodSchema = z.object({
    occurred_at: z.coerce.date(),
    hunger_level: z.enum(hunger_level.values, `Hunger level is required (${hunger_level.values.join(" | ")})`),
    suggested_actions: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
});

export const MealZodSchema = z.object({
    meal_type: z.enum(meal_type.values, `Meal type is required (${meal_type.values.join(" | ")})`),
    food_id: z.string(),
    servings: z.number(),
    vitamins: z.array(z.string()).optional(),
    logged_at: z.coerce.date(),
});

export type DailyLogValues = z.infer<typeof DailyLogZodSchema>;

export type CravingEventValues = z.infer<typeof CravingEventSchema>;

export type HungerEventValues = z.infer<typeof HungerEventZodSchema>;
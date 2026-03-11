import z from "zod";

export const energy_rating_enum = ["tired", "normal", "energetic"] as const;
export type EnergyRating = typeof energy_rating_enum[number];

export const stress_level_enum = ["relaxed", "low", "moderate", "high"] as const;
export type StressLevel = typeof stress_level_enum[number];

export const meal_type_enum = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = typeof meal_type_enum[number];

export const hunger_level_enum = ["little", "hungry", "starving"] as const;
export type HungerLevel = typeof hunger_level_enum[number];

export const craving_intensity_enum = ["mild", "moderate", "strong"] as const;
export type CravingIntensity = typeof craving_intensity_enum[number];

export const craving_type_enum = ["sweet", "salty", "savory", "spicy", "protein", "light", "other"] as const;
export type CravingType = typeof craving_type_enum[number];

export const craving_triggers_enum = ["stress", "boredom", "tiredness", "emotional", "habit", "late", "other"] as const;
export type CravingTrigger = typeof craving_triggers_enum[number];


export const DailyLogZodSchema = z.object({
    date: z.coerce.date(),
    morning_weight: z.number().positive("Morning weight must be a positive number"),
    energy_rating: z.enum(energy_rating_enum, `Energy rating is required (${energy_rating_enum.join(" | ")})`),
    sleep_hours: z.number().min(0).max(24, "Sleep hours must be between 0 and 24"),
    stress_level: z.enum(stress_level_enum, `Stress level is required (${stress_level_enum.join(" | ")})`),
});

export const CravingEventSchema = z.object({
	occurred_at: z.coerce.date(),
	craving_type: z.enum(craving_type_enum, `Craving type is required (${craving_type_enum.join(" | ")})`),
	intensity: z.enum(craving_intensity_enum, `Intensity is required (${craving_intensity_enum.join(" | ")})`),
	trigger: z.enum(craving_triggers_enum, `Trigger is required (${craving_triggers_enum.join(" | ")})`),
	suggested_actions: z.array(z.string()).optional(),
	reasoning: z.string().optional(),
});

export const HungerEventZodSchema = z.object({
	occurred_at: z.coerce.date(),
	hunger_level: z.enum(hunger_level_enum, `Hunger level is required (${hunger_level_enum.join(" | ")})`),
	suggested_actions: z.array(z.string()).optional(),
	reasoning: z.string().optional(),
});


export type DailyLogValues = z.infer<typeof DailyLogZodSchema>;

export type CravingEventValues = z.infer<typeof CravingEventSchema>;

export type HungerEventValues = z.infer<typeof HungerEventZodSchema>;
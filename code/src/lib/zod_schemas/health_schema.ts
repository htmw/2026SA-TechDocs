import { makeLabelMap, OptionList } from "@/lib/utils/options";
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

export const energy_rating_options: OptionList<string> = [
    { label: "Tired", value: "tired" },
    { label: "Normal", value: "normal" },
    { label: "Energetic", value: "energetic" },
];

export const stress_level_options: OptionList<string> = [
    { label: "Relaxed", value: "relaxed" },
    { label: "Low", value: "low" },
    { label: "Moderate", value: "moderate" },
    { label: "High", value: "high" },
];

export const meal_type_options: OptionList<string> = [
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Dinner", value: "dinner" },
    { label: "Snack", value: "snack" },
];

export const hunger_level_options: OptionList<string> = [
    { label: "Little", value: "little" },
    { label: "Hungry", value: "hungry" },
    { label: "Starving", value: "starving" },
];

export const craving_intensity_options: OptionList<string> = [
    { label: "Mild", value: "mild" },
    { label: "Moderate", value: "moderate" },
    { label: "Strong", value: "strong" },
];

export const craving_type_options: OptionList<string> = [
    { label: "Sweet", value: "sweet" },
    { label: "Salty", value: "salty" },
    { label: "Savory", value: "savory" },
    { label: "Spicy", value: "spicy" },
    { label: "Protein", value: "protein" },
    { label: "Light", value: "light" },
    { label: "Other", value: "other" },
];

export const craving_trigger_options: OptionList<string> = [
    { label: "Stress", value: "stress" },
    { label: "Boredom", value: "boredom" },
    { label: "Tiredness", value: "tiredness" },
    { label: "Emotional", value: "emotional" },
    { label: "Habit", value: "habit" },
    { label: "Late", value: "late" },
    { label: "Other", value: "other" },
];

export const energy_rating_label_map = makeLabelMap(energy_rating_options);
export const stress_level_label_map = makeLabelMap(stress_level_options);
export const meal_type_label_map = makeLabelMap(meal_type_options);
export const hunger_level_label_map = makeLabelMap(hunger_level_options);
export const craving_intensity_label_map = makeLabelMap(craving_intensity_options);
export const craving_type_label_map = makeLabelMap(craving_type_options);
export const craving_trigger_label_map = makeLabelMap(craving_trigger_options); 

export const DailyLogZodSchema = z.object({
    date: z.coerce.date(),
    timezone: z.string(),
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
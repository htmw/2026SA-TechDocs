import { z } from "zod";

export const avg_calories_enum = ["lt-1000", "1000-1500", "1500-2000", "2000-2500", "gt-2500"] as const;
export type AvgCalories = typeof avg_calories_enum[number];

export const current_energy_enum = ["low", "medium", "high"] as const;
export type CurrentEnergy = typeof current_energy_enum[number];

export const gender_enum = ["male", "female", "other"] as const;
export type Gender = typeof gender_enum[number];

export const avg_sleep_enum = ["lt-5", "5-7", "7-9", "9-11", "gt-11"] as const;
export type AvgSleep = typeof avg_sleep_enum[number];

export const ProfileZodSchema = z.object({
    dob: z.coerce.date("Date of birth is required"),
    weight: z.string().min(1, "Weight is required").transform((v) => Number(v) || 0),
    height: z.string().min(1, "Height is required").transform((v) => Number(v) || 0),
    occupation: z.string().min(1, "Occupation is required").transform((s) => s?.trim()),

    fitness_level: z.coerce.number("Fitness is required").min(0).max(5),

    avg_calories: z.enum(avg_calories_enum, "Average calories is required"),

    current_energy: z.enum(current_energy_enum, "Current energy level is required"),
    gender: z.enum(gender_enum, "Gender is required"),
    avg_sleep: z.enum(avg_sleep_enum, "Average sleep is required"),

    // hobbies: z.array(z.string().transform((s) => s.trim())).optional(),//ignored for now
});

export type ProfileSetupValues = z.infer<typeof ProfileZodSchema>;

export const BasicInfoSchema = ProfileZodSchema.pick({
    weight: true,
    height: true,
    dob: true,
    occupation: true,
});

export const gender_options = [
    { label: "Male", value: "male" as const },
    { label: "Female", value: "female" as const },
    { label: "Other", value: "other" as const },
];

export const fitness_options = [
    { label: "0", value: 0 as const },
    { label: "1", value: 1 as const },
    { label: "2", value: 2 as const },
    { label: "3", value: 3 as const },
    { label: "4", value: 4 as const },
    { label: "5", value: 5 as const },
];

export const sleep_options = [
    { label: "Less than 5 hours of sleep", value: "lt-5" as const },
    { label: "5-7 hours of sleep", value: "5-7" as const },
    { label: "7-9 hours of sleep", value: "7-9" as const },
    { label: "9-11 hours of sleep", value: "9-11" as const },
    { label: "More than 11 hours of sleep", value: "gt-11" as const },
];

export const calorie_options = [
    { label: "Less than 1000 Calories", value: "lt-1000" as const },
    { label: "1000-1500 Calories", value: "1000-1500" as const },
    { label: "1500-2000 Calories", value: "1500-2000" as const },
    { label: "2000-2500 Calories", value: "2000-2500" as const },
    { label: "More than 2500 Calories", value: "gt-2500" as const },
];

export const energy_options = [
    { label: "Low Energy", value: "low" as const },
    { label: "Mild Energy", value: "medium" as const },
    { label: "High Energy", value: "high" as const },
];

export const calorie_label_map = Object.fromEntries(
    calorie_options.map((option) => [option.value, option.label]),
) as Record<(typeof calorie_options)[number]["value"], string>;

export const gender_label_map = Object.fromEntries(
    gender_options.map((option) => [option.value, option.label]),
) as Record<(typeof gender_options)[number]["value"], string>;

export const sleep_label_map = Object.fromEntries(
    sleep_options.map((option) => [option.value, option.label]),
) as Record<(typeof sleep_options)[number]["value"], string>;

export const energy_label_map = Object.fromEntries(
    energy_options.map((option) => [option.value, option.label]),
) as Record<(typeof energy_options)[number]["value"], string>;
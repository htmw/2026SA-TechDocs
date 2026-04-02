import { avg_calories, avg_sleep, current_energy, fitness_level, gender } from "@/lib/enums";
import { z } from "zod";

export const timezones = Intl.supportedValuesOf('timeZone');

export const ProfileZodSchema = z.object({
    dob: z.coerce.date("Date of birth is required"),
    weight: z.string().min(1, "Weight is required").transform((v) => Number(v) || 0),
    height: z.string().min(1, "Height is required").transform((v) => Number(v) || 0),
    occupation: z.string().min(1, "Occupation is required").transform((s) => s?.trim()),
    timezone: z.enum(timezones, "Timezone is required").transform((s) => s?.trim()),

    fitness_level: z.enum(fitness_level.values, "Fitness level is required"),

    avg_calories: z.enum(avg_calories.values, "Average calories is required"),

    current_energy: z.enum(current_energy.values, "Current energy level is required"),
    gender: z.enum(gender.values, "Gender is required"),
    avg_sleep: z.enum(avg_sleep.values, "Average sleep is required"),
    
    goals: z.array(z.string().transform((s) => s.trim())).optional(),
    hobbies: z.array(z.string().transform((s) => s.trim())).optional(),
});

export type ProfileSetupValues = z.infer<typeof ProfileZodSchema>;

export const BasicInfoSchema = ProfileZodSchema.pick({
    weight: true,
    height: true,
    dob: true,
    occupation: true,
    timezone: true,
});
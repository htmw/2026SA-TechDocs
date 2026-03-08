import z from "zod";

export const EmailSchema = z.email("Invalid email address").transform((s) => s.trim());

export const LoginZodSchema = z.object({
    email: EmailSchema,
    password: z.string().min(1, "Password is required"),
}).strict();

export const SignupZodSchema = z.object({
    name: z.string().min(1).transform((s) => s.trim()),
    email: EmailSchema,
    password: z.string().min(1, "Password is required"),
}).strict();

export const SetupZodSchema = z.object({
    dob: z.date(),
    weight: z.number().positive(),
    height: z.number().positive(),
    occupation: z.string().transform((s) => s?.trim()).optional(),
    fitness_level: z.string().transform((s) => s?.trim()).optional(),
    hobbies: z.array(z.string().transform((s) => s.trim())).optional(),
    avg_calories: z.number().positive().optional(),
    current_energy: z.number().positive().optional(),
    gender: z.string().transform((s) => s?.trim()).optional(),
    avg_sleep: z.number().positive().optional(),
}).strict();

export const ProfileZodSchema = z.object({
    dob: z.date().optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    occupation: z.string().optional().transform((s) => s?.trim()),
    fitness_level: z.string().optional().transform((s) => s?.trim()),
    hobbies: z.array(z.string().transform((s) => s.trim())).optional(),
    avg_calories: z.number().positive().optional(),
    current_energy: z.number().positive().optional(),
    gender: z.string().optional().transform((s) => s?.trim()),
    avg_sleep: z.number().positive().optional(),
}).strict();
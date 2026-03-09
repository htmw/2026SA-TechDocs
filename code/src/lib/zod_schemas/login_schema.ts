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
    confirm_password: z.string().min(1, "Password is required"),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
}).strict();
export interface Env {
    NODE_ENV: "development" | "production" | "test";

    MONGODB_URL: string;

    APP_NAME: string;

    OPENAI_API_KEY: string;
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
    if (cachedEnv) return cachedEnv;

    const missing: string[] = [];

    const requireKey = (key: keyof Env): string => {
        const val = process.env[key];
        if (!val) {
            missing.push(key);
            return "";
        }
        return val;
    };

    const env: Env = {
        NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",

        MONGODB_URL: requireKey("MONGODB_URL"),

        APP_NAME: requireKey("APP_NAME"),
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    };

    if (missing.length > 0) {
        throw new Error(
            `[env.ts] Missing required environment variables:\n${missing.join(", ")}`
        );
    }

    cachedEnv = env;
    return env;
}

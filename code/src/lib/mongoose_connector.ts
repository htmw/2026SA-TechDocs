import { getEnv } from "@/lib/env";
import mongoose from "mongoose";

const URI = getEnv().MONGODB_URL || "";
if (!URI) { throw new Error("Missing MONGODB_URL") };

declare global {
    var __MONGOOSE_PROMISE__: Promise<typeof mongoose> | undefined;
}

export function getMongoose() {
    if (!global.__MONGOOSE_PROMISE__) {
        // Connects to MongoDB.
        console.log("Connecting to MongoDB...");

        global.__MONGOOSE_PROMISE__ = mongoose.connect(URI, {
            serverSelectionTimeoutMS: 5000,
        })
            .then((connection) => {
                // Confirms the app connected to MongoDB.
                console.log("MongoDB Connected");
                return connection;
            })
            .catch((error) => {
                // Clears promise to allow retry.                
                global.__MONGOOSE_PROMISE__ = undefined;
                console.error("MongoDB connection failed:", error);
                throw error;
            });
    }
    return global.__MONGOOSE_PROMISE__;
}
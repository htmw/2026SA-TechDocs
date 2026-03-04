import { getEnv } from "@/lib/env";
import mongoose from "mongoose";

const URI = getEnv().MONGODB_URL || "";
if (!URI) { throw new Error("Missing MONGODB_URL") };

declare global {
    var __MONGOOSE_PROMISE__: Promise<typeof mongoose> | undefined;
}

export function getMongoose() {
    if (!global.__MONGOOSE_PROMISE__) {
        global.__MONGOOSE_PROMISE__ = mongoose.connect(URI, {});
    }
    return global.__MONGOOSE_PROMISE__;
}
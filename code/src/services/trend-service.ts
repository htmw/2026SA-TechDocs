import { DailyLog } from "@/database/models/daily_log";
import { Types } from "mongoose";

export async function getUserTrends(userId: string): Promise<string[]> {
    const logs = await DailyLog.find({ 
        user_id: new Types.ObjectId(userId),
        morning_weight: { $exists: true, $ne: null },
        sleep_hours: { $exists: true, $ne: null },
    })
    .sort({ date: -1 })
    .limit(7)
    .exec();

    if (logs.length < 2) return [];

    const weight_trend = logs[0].morning_weight > logs[logs.length - 1].morning_weight ? "Your weight is trending up this week." : "Your weight is trending down this week.";
    const sleep_trend = logs[0].sleep_hours > logs[logs.length - 1].sleep_hours ? "Your sleep hours are trending up this week." : "Your sleep hours are trending down this week.";
    return [weight_trend, sleep_trend];
}
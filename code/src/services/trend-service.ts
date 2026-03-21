import { DailyLog } from "@/database/models/daily_log";
import { Types } from "mongoose";

export async function getUserTrends(userId: string): Promise<string[]> {
    const logs = await DailyLog.find({ 
        user_id: new Types.ObjectId(userId),
        morning_weight: { $exists: true, $ne: null } 
    })
    .sort({ date: -1 })
    .limit(7)
    .exec();

    if (logs.length < 2) return [];

    const latest = logs[0].morning_weight;
    const oldest = logs[logs.length - 1].morning_weight;
    const weight_trend = latest > oldest ? "Your weight is trending up this week." : "Your weight is trending down this week.";
 
    return [weight_trend];
}
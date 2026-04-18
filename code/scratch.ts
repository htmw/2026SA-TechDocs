import mongoose from "mongoose";
import { DailyLog } from "./src/database/models/daily_log";
import { User } from "./src/database/models/user";

async function main() {
    await mongoose.connect("mongodb+srv://teamdocs:L5cbWfLtz1Ro4rXf@cluster0.prhprw5.mongodb.net/nutri_ai_dev");
    try {
        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            return;
        }
        console.log("Found user:", user._id);
        
        const testDate = new Date("2020-01-01T00:00:00Z");
        let daily_log = await DailyLog.getDailyLogByDate(user._id, testDate);
        console.log("Existing log:", daily_log ? "Yes" : "No");

        if (!daily_log) {
            console.log("Creating log...");
            daily_log = await DailyLog.createDailyLog(user._id, {
                date: testDate,
                timezone: "UTC",
                morning_weight: 150,
                sleep_hours: 8,
                energy_rating: "energetic",
                stress_level: "relaxed",
            });
            console.log("Created successfully!");
        }

        // Test Add Meal
        console.log("Adding meal...");
        const result = await daily_log.addMeal({
            meal_type: "breakfast",
            food_item: "Test Apple",
            calories: 50,
            protein: 0,
            carbohydrates: 0,
            carbs: 0, // In Mongoose
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cholesterol: 0,
            water_intake: 0,
            logged_at: new Date()
        } as any);

        console.log("Meal added successfully, result:", !!result);

    } catch (err) {
        console.error("Mongoose Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}
main();

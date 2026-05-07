import mongoose from "mongoose";
import { Food } from "./models/food"; // adjust path if needed

const MONGODB_URL = process.env.MONGODB_URL as string;

async function seedFoods() {
    if (!MONGODB_URL) {
        throw new Error("MONGODB_URL missing");
    }

    await mongoose.connect(MONGODB_URL);

    console.log("Connected to MongoDB");

    // clear existing foods
    await Food.deleteMany({});
    console.log("Cleared foods collection");

    await Food.insertMany([
        {
            food_item: "Apple",
            calories: 95,
            protein: 0,
            carbs: 25,
            fat: 0,
            fiber: 4,
            sugar: 19,
            sodium: 2,
            cholesterol: 0,
            water_intake: 0,
        },
        {
            food_item: "Chicken Breast",
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            sodium: 74,
            cholesterol: 85,
            water_intake: 0,
        },
        {
            food_item: "White Rice",
            calories: 206,
            protein: 4,
            carbs: 45,
            fat: 0,
            fiber: 1,
            sugar: 0,
            sodium: 1,
            cholesterol: 0,
            water_intake: 0,
        },
    ]);

    console.log("Foods seeded successfully");

    await mongoose.disconnect();
}

seedFoods().catch(err => {
    console.error(err);
    process.exit(1);
});
import mongoose from "mongoose";
import { Food } from "./src/database/models/food";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
    const foods = await Food.find({}).limit(5).exec();
    console.log(JSON.stringify(foods, null, 2));
    process.exit(0);
});

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const foodSchema = new mongoose.Schema({}, { strict: false });
const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const foods = await Food.find({}).limit(5).exec();
    console.log(JSON.stringify(foods, null, 2));
    process.exit(0);
});

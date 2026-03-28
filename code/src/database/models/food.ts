import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import { IFood } from "@/lib/types/mongo_food_types";
import { FoodItem } from "@/lib/zod_schemas/food_schema";

export interface IFoodMethods {

}

export interface FoodModel extends Model<IFood, {}, IFoodMethods> {
    findByFoodItem(food_item: string): Promise<HydratedFood | null>;
}

export type HydratedFood = HydratedDocument<IFood, IFoodMethods>;

const FoodSchema = new Schema<IFood, FoodModel, IFoodMethods>(
    {
        food_item: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        categories: {
            type: [String],
            default: [],
        },
        calories: {
            type: Number,
            required: true,
            min: 0,
        },
        protein: {
            type: Number,
            required: true,
            min: 0,
        },
        carbohydrates: {
            type: Number,
            required: true,
            min: 0,
        },
        fat: {
            type: Number,
            required: true,
            min: 0,
        },
        fiber: {
            type: Number,
            required: true,
            min: 0,
        },
        sugars: {
            type: Number,
            required: true,
            min: 0,
        },
        sodium: {
            type: Number,
            required: true,
            min: 0,
        },
        cholesterol: {
            type: Number,
            required: true,
            min: 0,
        },
        water_intake: {
            type: Number,
            required: true,
            min: 0,
        },
        serving_quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        serving_unit: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        methods: {
        },
        statics: {
            async findByFoodItem(this: FoodModel, food_item: string): Promise<HydratedFood | null> {
                return this.findOne({ food_item }).exec();
            },
        },
    }
);

FoodSchema.index({ food_item: 1 }, { unique: true});

export const Food =
    (mongoose.models["Food"] as FoodModel) ||
    mongoose.model<IFood, FoodModel>("Food", FoodSchema);

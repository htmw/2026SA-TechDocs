import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import { IFood } from "@/lib/types/mongo_food_types";
import { FoodItem } from "@/lib/zod_schemas/food_schema";
import { buildSearch, QuerySearchConfig } from "@/lib/utils/query_filter";

export interface IFoodMethods {

}

export interface FoodModel extends Model<IFood, {}, IFoodMethods> {
    findByFoodItem(food_item: string): Promise<HydratedFood | null>;
    search(
        params: Record<string, string | undefined>
    ): Promise<{ foods: HydratedFood[]; pagination: { page: number; limit: number; count: number; } }>;
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

            async search(
                this: FoodModel,
                params: Record<string, string | undefined>
            ) {
                const config: QuerySearchConfig = {
                    query_fields: ["food_item", "categories"],
                    string_fields: ["food_item"],
                    category_field: "categories",
                    number_fields: [
                        "calories",
                        "protein",
                        "carbohydrates",
                        "fat",
                        "fiber",
                        "sugars",
                        "sodium",
                        "cholesterol",
                        "water_intake",
                        "serving_quantity",
                    ],
                    date_fields: ["createdAt", "updatedAt"],
                    default_sort_field: "food_item",
                };

                const sortFields = [
                    "food_item",
                    "categories",
                    "calories",
                    "protein",
                    "carbohydrates",
                    "fat",
                    "fiber",
                    "sugars",
                    "sodium",
                    "cholesterol",
                    "water_intake",
                    "serving_quantity",
                    "serving_unit",
                    "createdAt",
                    "updatedAt",
                ];

                const { query, sort, limit, page } = buildSearch(params, config, sortFields);

                const foods = await this.find(query)
                    .sort(sort)
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .exec();

                return {
                    foods,
                    pagination: {
                        page,
                        limit,
                        count: foods.length,
                    },
                };
            },
        },
    }
);

export const Food =
    (mongoose.models["Food"] as FoodModel) ||
    mongoose.model<IFood, FoodModel>("Food", FoodSchema);

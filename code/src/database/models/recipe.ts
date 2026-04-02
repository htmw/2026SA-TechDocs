import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import { IRecipes } from "@/lib/types/mongo_recipe_types";

export interface IRecipeMethods {

}

export interface RecipeModel extends Model<IRecipes, {}, IRecipeMethods> {
    findByName(name: string): Promise<HydratedRecipe | null>;
}

export type HydratedRecipe = HydratedDocument<IRecipes, IRecipeMethods>;

const RecipeSchema = new Schema<IRecipes, RecipeModel, IRecipeMethods>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        categories: {
            type: [String],
            default: [],
        },
        directions: {
            type: [String],
            default: [],
        },
        ingredients: {
            type: [String],
            default: [],
        },
        calories: {
            type: Number,
            required: true,
            min: 0,
        },
        fat: {
            type: Number,
            required: true,
            min: 0,
        },
        protein: {
            type: Number,
            required: true,
            min: 0,
        },
        sodium: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
        methods: {
        },
        statics: {
            async findByName(this: RecipeModel, name: string): Promise<HydratedRecipe | null> {
                return this.findOne({ name }).exec();
            },
        },
    }
);

export const Recipe =
    (mongoose.models["Recipe"] as RecipeModel) ||
    mongoose.model<IRecipes, RecipeModel>("Recipe", RecipeSchema);

import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import { IRecipes } from "@/lib/types/mongo_recipe_types";
import { buildSearch, QuerySearchConfig } from "@/lib/utils/query_filter";

export interface IRecipeMethods {

}

export interface RecipeModel extends Model<IRecipes, {}, IRecipeMethods> {
    findByName(name: string): Promise<HydratedRecipe | null>;
    search(
        params: Record<string, string | undefined>
    ): Promise<{ recipes: HydratedRecipe[]; pagination: { page: number; limit: number; count: number; } }>;
}

export type HydratedRecipe = HydratedDocument<IRecipes, IRecipeMethods>;

const RecipeSchema = new Schema<IRecipes, RecipeModel, IRecipeMethods>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true
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
        fat: {
            type: Number,
            required: true,
            min: 0,
        },
        sodium: {
            type: Number,
            required: true,
            min: 0,
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
        }
    },
    {
        timestamps: true,
        methods: {
        },
        statics: {
            async findByName(this: RecipeModel, name: string): Promise<HydratedRecipe | null> {
                return this.findOne({ name }).exec();
            },

            async search(
                this: RecipeModel,
                params: Record<string, string | undefined>
            ) {
                const config: QuerySearchConfig = {
                    query_fields: ["title", "categories"],
                    string_fields: ["title"],
                    category_fields: ["categories", "directions", "ingredients"],
                    number_fields: [
                        "rating",
                        "calories",
                        "protein",
                        "fat",
                        "sodium",
                    ],
                    date_fields: ["createdAt", "updatedAt"],
                    default_sort_field: "title",
                };

                const sortFields = [
                    "title",
                    "rating",
                    "categories",
                    "calories",
                    "protein",
                    "fat",
                    "sodium",
                    "createdAt",
                    "updatedAt",
                ];

                const { query, sort, limit, page } = buildSearch(params, config, sortFields);
                console.log(query);

                const recipes = await this.find(query)
                    .sort(sort)
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .exec();

                return {
                    recipes,
                    pagination: {
                        page,
                        limit,
                        count: recipes.length,
                    },
                };
            },
        },
    }
);

export const Recipe =
    (mongoose.models["Recipe"] as RecipeModel) ||
    mongoose.model<IRecipes, RecipeModel>("Recipe", RecipeSchema);

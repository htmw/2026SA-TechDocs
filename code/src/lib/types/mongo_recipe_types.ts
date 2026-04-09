import { Types } from "mongoose";
import { ToPrimitive } from "./mongo_primitive_types";

export interface IRecipes {
    _id: Types.ObjectId;
    title: string;
    rating: number;
    calories: number;
    protein: number;
    fat: number;
    sodium: number;
    categories: String[];
    directions: String[];
    ingredients: String[];
}

export type ClientRecipes = ToPrimitive<IRecipes>;
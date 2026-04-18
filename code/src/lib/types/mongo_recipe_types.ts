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
    categories: string[];
    directions: string[];
    ingredients: string[];
}

export type ClientRecipes = ToPrimitive<IRecipes>;
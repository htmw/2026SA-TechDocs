import { Types } from "mongoose";
import { ToPrimitive } from "./mongo_primitive_types";

export interface IRecipes {
    _id: Types.ObjectId;
    categories: String[];
    directions: String[];
    ingredients: String[];
    calories: number;
    fat: number;
    protein: number;
    sodium: number;
    name: string;
}

export type ClientRecipes = ToPrimitive<IRecipes>;
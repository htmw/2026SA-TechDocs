import { Types } from "mongoose";
import { ToPrimitive } from "./mongo_primitive_types";

export interface IFood {
    _id: Types.ObjectId;
    food_item: string;
    categories: string[];
    calories: number;
    protein: number; //g
    carbohydrates: number; //g
    fat: number; //g
    fiber: number; //g
    sugar: number; //g
    sodium: number; //mg
    cholesterol: number; //mg
    water_intake: number; //ml
    serving_quantity: number; //g
    serving_unit: string;
}

export type ClientFood = ToPrimitive<IFood>;
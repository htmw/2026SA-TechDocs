import { MealType } from "@/lib/enums";
import { Types } from "mongoose";
import { ToPrimitive } from "./mongo_primitive_types";

export interface IFood {
    _id: Types.ObjectId;
    food_item: string;
    category: string;
    meal_type: MealType;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugars: number;
    sodium: number;
    cholesterol: number;
    water_intake: number;
}

export type ClientFood = ToPrimitive<IFood>;
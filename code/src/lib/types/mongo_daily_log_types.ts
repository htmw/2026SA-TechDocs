import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { Types } from "mongoose";

//Main Document
export interface IWeeklyDietPlan {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    week_start: Date;
    meals: IMealPlan[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IMealPlan {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
}

export type ClientWeeklyDietPlan = ToPrimitive<IWeeklyDietPlan>;
import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { CravingIntensity, CravingTrigger, CravingType, EnergyRating, HungerLevel, MealType, StressLevel } from "@/lib/enums";
import { Types } from "mongoose";

export interface IDailyLog {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    date: Date;
    timezone: string;
    morning_weight: number;
    energy_rating: EnergyRating;
    sleep_hours: number;
    stress_level: StressLevel;
    meals: IMealLog[];
    hunger_events: IHungerEvent[];
    craving_events: ICravingEvent[];
}

export interface IMealLog {
    meal_type: MealType;
    description: string;
    calories: number;
    protein: number;
    sodium: number;
    fat: number;
    servings?: string;
    vitamins?: string[];
    logged_at: Date;
}

export interface IHungerEvent {
    _id: Types.ObjectId;
    occurred_at: Date;
    hunger_level: HungerLevel;
    suggested_actions: string[];
    reasoning: string;
}

export interface ICravingEvent {
    _id: Types.ObjectId;
    occurred_at: Date;
    craving_type: CravingType;
    intensity: CravingIntensity;
    trigger: CravingTrigger;
    suggested_actions: string[];
    reasoning: string;
}

export type ClientDailyLog = ToPrimitive<IDailyLog>;
export type ClientMealLog = ToPrimitive<IMealLog>;
export type ClientHungerEvent = ToPrimitive<IHungerEvent>;
export type ClientCravingEvent = ToPrimitive<ICravingEvent>;

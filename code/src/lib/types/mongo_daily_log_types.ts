import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { CravingIntensity, CravingTrigger, CravingType, EnergyRating, HungerLevel, MealType, StressLevel } from "@/lib/zod_schemas/health_schema";
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
    prediction: IPrediction;
    compliance: ICompliance;
}

export interface IMealLog {
    meal_type: MealType;
    description: string;
    calories: number;
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

export interface IPrediction {
    appetite_risk_score: number; // 1-10 scale
    over_eating_risk_probability: number;
    weight_loss_success_probability: number;
    projected_timeline_days: number;
}

export interface ICompliance {
    commitment_rate: number; // 1-10 scale
    portion_control_score: number; // 1-10 scale
    consistency_score: number; // 1-10 scale
}

export type ClientDailyLog = ToPrimitive<IDailyLog>;
export type ClientMealLog = ToPrimitive<IMealLog>;
export type ClientHungerEvent = ToPrimitive<IHungerEvent>;
export type ClientCravingEvent = ToPrimitive<ICravingEvent>;
export type ClientPrediction = ToPrimitive<IPrediction>;
export type ClientCompliance = ToPrimitive<ICompliance>;

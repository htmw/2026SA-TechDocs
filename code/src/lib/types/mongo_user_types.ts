import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { AvgCalories, AvgSleep, CurrentEnergy, Gender } from "@/lib/zod_schemas/profile_setup_schema";
import { Types } from "mongoose";

export interface IDietRestriction {
    allergies?: string[];//convert to enum later
    religious?: string[];//convert to enum later
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    profile: IUserProfile;
    goals: string[];
    setup_complete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserProfile {
    dob?: Date;
    height?: number;
    weight?: number;
    occupation?: string;
    timezone?: string;
    fitness_level?: number;
    hobbies?: string[];
    avg_calories?: AvgCalories;
    current_energy?: CurrentEnergy;
    gender?: Gender;
    avg_sleep?: AvgSleep;
}

export type IPublicUser =
    Omit<IUser, "password">;

export type ClientUser = ToPrimitive<IPublicUser>;   
export type ClientUserProfile = ToPrimitive<IUserProfile>;   

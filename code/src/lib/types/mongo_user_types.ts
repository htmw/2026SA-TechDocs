import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { AvgCalories, AvgSleep, CurrentEnergy, FitnessLevel, Gender } from "@/lib/enums";
import { Types } from "mongoose";

export interface IDietRestriction {
    allergies?: string[];//convert to enum later
    preferences?: string[];//convert to enum later
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    profile: IUserProfile;
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
    fitness_level?: FitnessLevel;
    hobbies?: string[];
    avg_calories?: AvgCalories;
    current_energy?: CurrentEnergy;
    gender?: Gender;
    avg_sleep?: AvgSleep;
    goals?: string[];
}

export type IPublicUser =
    Omit<IUser, "password">;

export type ClientUser = ToPrimitive<IPublicUser>;   
export type ClientUserProfile = ToPrimitive<IUserProfile>;   

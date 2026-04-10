import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { AvgCalories, AvgSleep, CurrentEnergy, FitnessLevel, Gender } from "@/lib/enums";
import { Types } from "mongoose";

// saved diet restriction groups for a user
export interface IDietRestriction {
    allergies?: string[];
    preferences?: string[];
}

// all user fields saved in the database
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

// profile fields saved inside the user record
export interface IUserProfile {
    dob?: Date;
    height?: number;
    weight?: number;
    occupation?: string;
    timezone?: string;
    fitness_level?: FitnessLevel;
    avg_calories?: AvgCalories;
    current_energy?: CurrentEnergy;
    gender?: Gender;
    avg_sleep?: AvgSleep;
    goals?: string[];
    hobbies?: string[];
    diet_restrictions?: string[];
    medical_history?: string[];
}

// user fields returned without the password
export type IPublicUser =
    Omit<IUser, "password">;

// public user data changed into plain values
export type ClientUser = ToPrimitive<IPublicUser>;

// profile data changed into plain values
export type ClientUserProfile = ToPrimitive<IUserProfile>;

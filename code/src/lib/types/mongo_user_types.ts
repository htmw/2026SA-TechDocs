import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { Types } from "mongoose";

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
    fitness_level?: string;
    hobbies?: string[];
    avg_calories?: number;
    current_energy?: number;
    gender?: string;
    avg_sleep?: number;
    bmi?: number;
}

export type IPublicUser =
    Omit<IUser, "password">;

export type ClientUser = ToPrimitive<IPublicUser>;   

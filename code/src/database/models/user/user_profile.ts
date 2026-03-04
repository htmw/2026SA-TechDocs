import { Schema } from "mongoose";

export interface IUserProfile {
    age: number;
    height: number;
    weight: number;
    occupation: string;
    fitness_level: string;
    hobbies: string[];
    avg_calories: number;
    current_energy: number;
    gender: string;
    avg_sleep: number;
    bmi: number;
}

export const UserProfileSchema = new Schema<IUserProfile>(
    {
        age: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        height: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        weight: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        occupation: { 
            type: String, 
            trim: true, 
            required: true 
        },
        fitness_level: { 
            type: String, 
            trim: true, 
            required: true 
        },
        hobbies: [{ 
            type: String, 
            trim: true 
        }],
        avg_calories: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        current_energy: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        gender: { 
            type: String, 
            trim: true, 
            required: true 
        },
        avg_sleep: { 
            type: Number, 
            min: 0, 
            required: true 
        },
        bmi: { 
            type: Number, 
            min: 0, 
            required: true 
        },
    },
    { _id: false }
);
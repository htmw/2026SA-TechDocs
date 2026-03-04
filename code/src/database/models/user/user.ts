import { IUserProfile, UserProfileSchema } from "@/database/models/user/user_profile";
import mongoose, { Schema, Model, HydratedDocument } from "mongoose";


//Document Interface
export interface IUser {
    name: string;
    email: string;
    password: string;
    profile: IUserProfile;
    goals: string[];
}

//Methods Interface
export interface IUserMethods {
    getPublicProfile(): { 
        id: string; 
        name: string; 
        email: string;
        profile: IUserProfile; 
        goals: string[];
    };
}

//Model Interface, which includes both the document and the methods
export interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods> | null>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        profile: {
            type: UserProfileSchema,
            required: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

//Static Methods
UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email });
};

//Document Methods
UserSchema.methods.getPublicProfile = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        profile: this.profile,
        goals: this.goals,
    };
};

export const User =
    (mongoose.models.User as UserModel) ||
    mongoose.model<IUser, UserModel>("User", UserSchema);
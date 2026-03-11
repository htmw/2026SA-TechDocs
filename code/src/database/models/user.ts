import { IPublicUser, IUser, IUserProfile } from "@/lib/types/mongo_user_types";
import { avg_calories_enum, avg_sleep_enum, current_energy_enum, gender_enum } from "@/lib/zod_schemas/profile_setup_schema";
import mongoose, { Schema, Model, HydratedDocument, Types } from "mongoose";

export const UserProfileSchema = new Schema<IUserProfile>(
    {
        dob: {
            type: Date,
        },
        height: {
            type: Number,
            min: 0,
        },
        weight: {
            type: Number,
            min: 0,
        },
        occupation: {
            type: String,
            trim: true,
        },
        fitness_level: {
            type: Number,
        },
        hobbies: [{
            type: String,
            trim: true
        }],
        avg_calories: {
            type: String,
            enum: avg_calories_enum,
        },
        current_energy: {
            type: String,
            enum: current_energy_enum,
        },
        gender: {
            type: String,
            enum: gender_enum,
        },
        avg_sleep: {
            type: String,
            enum: avg_sleep_enum,
        }
    },
    { _id: false }
);

//Methods Interface
export interface IUserMethods {
    getPublicProfile(): IPublicUser;
    completeFirstTimeSetup(profileData: Partial<IUserProfile>): Promise<HydratedDocument<IUser, IUserMethods> | null>;
    updateProfile(profileData: Partial<IUserProfile>): Promise<HydratedDocument<IUser, IUserMethods>>;
}

//Model Interface, which includes both the document and the methods
export interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods> | null>;
    findByUserId(id: Types.ObjectId): Promise<HydratedDocument<IUser, IUserMethods> | null>;
    getUserPassword(id: Types.ObjectId): Promise<string | null>;
    createUserAccount(name: string, email: string, password: string): Promise<HydratedDocument<IUser, IUserMethods>>;
    getAll(): Promise<HydratedDocument<IUser, IUserMethods>[]>;
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
        goals: {
            type: [String],
        },
        setup_complete: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

//Static Methods
UserSchema.statics.getAll = function () {
    return this.find({});
}

UserSchema.statics.findByUserId = async function (id: Types.ObjectId) {
    return await this.findById(id);
};

UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email });
};

UserSchema.statics.getUserPassword = async function (id: Types.ObjectId) {
    const user = await this.findById(id, { password: 1 }).exec();
    if (!user) {
        return null;
    }
    return user.password;
};

UserSchema.statics.createUserAccount = async function (
    name: string,
    email: string,
    password: string,
) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
        //TODO: throw more detailed error
        return null;
    }

    const user = this.create({
        name,
        email,
        password,
        profile: {}, // initialize with empty profile
    });

    return user;
}

//Document Methods
UserSchema.methods.getPublicProfile = function (): IPublicUser {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        profile: this.profile,
        goals: this.goals,
        setup_complete: this.setup_complete,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

UserSchema.methods.completeFirstTimeSetup = async function (profileData: Partial<IUserProfile>) {
    if (this.setup_complete) {
        return null;
    }
    this.setup_complete = true;
    return await this.updateProfile(profileData);
}

UserSchema.methods.updateProfile = async function (profileData: Partial<IUserProfile>) {
    if(profileData.dob){
        profileData.dob.setUTCHours(0, 0, 0, 0);
    }
    this.profile = {
        ...this.profile,
        ...profileData,
    };

    return await this.save();
}

export const User =
    (mongoose.models.User as UserModel) ||
    mongoose.model<IUser, UserModel>("User", UserSchema);
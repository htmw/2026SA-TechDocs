import { avg_calories, avg_sleep, current_energy, fitness_level, gender } from "@/lib/enums";
import { IPublicUser, IUser, IUserProfile } from "@/lib/types/mongo_user_types";
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
        timezone: {
            type: String,
        },
        fitness_level: {
            type: String,
            enum: fitness_level.values,
        },
        avg_calories: {
            type: String,
            enum: avg_calories.values,
        },
        current_energy: {
            type: String,
            enum: current_energy.values,
        },
        gender: {
            type: String,
            enum: gender.values,
        },
        avg_sleep: {
            type: String,
            enum: avg_sleep.values,
        },
        goals: {
            type: [String],
            enum: avg_sleep.values,
        },
        hobbies: [{
            type: String,
            trim: true
        }],
    },
    { _id: false }
);

//Methods Interface
export interface IUserMethods {
    getPublicProfile(): IPublicUser;
    completeFirstTimeSetup(profileData: Partial<IUserProfile>): Promise<HydratedUser | null>;
    updateProfile(profileData: Partial<IUserProfile>): Promise<HydratedUser>;
}

//Model Interface, which includes both the document and the methods
export interface UserModel extends Model<IUser, {}, IUserMethods> {
    getAll(): Promise<HydratedUser[]>;
    findByEmail(email: string): Promise<HydratedUser | null>;
    findByUserId(id: Types.ObjectId): Promise<HydratedUser | null>;
    getUserPassword(id: Types.ObjectId): Promise<string | null>;
    createUserAccount(name: string, email: string, password: string): Promise<HydratedUser>;
}

export type HydratedUser = HydratedDocument<IUser, IUserMethods>;

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
        setup_complete: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
        statics: {
            getAll() {
                return this.find({});
            },

            findByEmail(email: string) {
                return this.findOne({ email });
            },

            async findByUserId(id: Types.ObjectId) {
                return await this.findById(id);
            },

            async getUserPassword(id: Types.ObjectId) {
                const user = await this.findById(id, { password: 1 }).exec();
                if (!user) {
                    return null;
                }
                return user.password;
            },

            async createUserAccount(
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
        },
        methods: {
            getPublicProfile(): IPublicUser {
                return {
                    _id: this._id,
                    name: this.name,
                    email: this.email,
                    profile: this.profile,
                    setup_complete: this.setup_complete,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt,
                };
            },

            async completeFirstTimeSetup(profileData: Partial<IUserProfile>) {
                if (this.setup_complete) {
                    return null;
                }
                this.setup_complete = true;
                return await this.updateProfile(profileData);
            },

            async updateProfile(profileData: Partial<IUserProfile>) {
                if (profileData.dob) {
                    profileData.dob.setUTCHours(0, 0, 0, 0);
                }
                this.profile = {
                    ...this.profile,
                    ...profileData,
                };

                return await this.save();
            }
        }
    }
);

export const User =
    (mongoose.models.User as UserModel) ||
    mongoose.model<IUser, UserModel>("User", UserSchema);
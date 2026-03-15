import { ICompliance, ICravingEvent, IDailyLog, IHungerEvent, IMealLog, IPrediction } from "@/lib/types/mongo_daily_log_types";
import { startOfDay } from "date-fns";
import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import { DailyLogValues } from "@/lib/zod_schemas/health_schema";
import { craving_intensity, craving_triggers, craving_type, energy_rating, hunger_level, meal_type, stress_level } from "@/lib/enums";

const MealLogSchema = new Schema<IMealLog, DailyLogModel>(
    {
        meal_type: {
            type: String,
            enum: meal_type.values,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        calories: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const HungerEventSchema = new Schema<IHungerEvent, DailyLogModel>(
    {
        occurred_at: {
            type: Date,
            required: true,
        },
        hunger_level: {
            type: String,
            enum: hunger_level.values,
            required: true,
        },
        suggested_actions: {
            type: [String],
        },
        reasoning: {
            type: String,
        },
    }
);

const CravingEventSchema = new Schema<ICravingEvent, DailyLogModel>(
    {
        occurred_at: {
            type: Date,
            required: true,
        },
        craving_type: {
            type: String,
            enum: craving_type.values,
            required: true,
        },
        intensity: {
            type: String,
            enum: craving_intensity.values,
            required: true,
        },
        trigger: {
            type: String,
            enum: craving_triggers.values,
            required: true,
        },
        suggested_actions: {
            type: [String],
        },
        reasoning: {
            type: String,
        },
    }
);

const PredictionSchema = new Schema<IPrediction, DailyLogModel>(
    {
        appetite_risk_score: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        over_eating_risk_probability: {
            type: Number,
            required: true,
        },
        weight_loss_success_probability: {
            type: Number,
            required: true,
        },
        projected_timeline_days: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const ComplianceSchema = new Schema<ICompliance, DailyLogModel>(
    {
        commitment_rate: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        portion_control_score: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        consistency_score: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
    },
    { _id: false }
);

//Methods Interface
export interface IDailyLogMethods {
    getCravingEventByTime(this: HydratedDailyLog, date: Date): ICravingEvent | null;
    getCravingEvent(this: HydratedDailyLog, id: Types.ObjectId): ICravingEvent | null;
    addCravingEvent(this: HydratedDailyLog, event: ICravingEvent): Promise<HydratedDailyLog | null>;
    updateCravingEvent(this: HydratedDailyLog, id: Types.ObjectId, updates: Partial<ICravingEvent>): Promise<ICravingEvent | null>;
    deleteCravingEvent(this: HydratedDailyLog, id: Types.ObjectId): Promise<boolean>;

    getHungerEventByTime(this: HydratedDailyLog, date: Date): IHungerEvent | null;
    getHungerEvent(this: HydratedDailyLog, id: Types.ObjectId): IHungerEvent | null;
    addHungerEvent(this: HydratedDailyLog, event: IHungerEvent): Promise<HydratedDailyLog | null>;
    updateHungerEvent(this: HydratedDailyLog, id: Types.ObjectId, updates: Partial<IHungerEvent>): Promise<IHungerEvent | null>;
    deleteHungerEvent(this: HydratedDailyLog, id: Types.ObjectId): Promise<boolean>;
}

//Model Interface, which includes both the document and the methods
export interface DailyLogModel extends Model<IDailyLog, {}, IDailyLogMethods> {
    hasDailyLog(user_id: Types.ObjectId, date: Date): Promise<boolean>;
    createDailyLog(user_id: Types.ObjectId, data: DailyLogValues): Promise<HydratedDailyLog>;
    getDailyLogByDate(user_id: Types.ObjectId, date: Date): Promise<HydratedDailyLog | null>;
}

/**
 * The hyddrated document type, which includes both the properties of IDailyLog and the methods defined in IDailyLogMethods
 */
export type HydratedDailyLog = HydratedDocument<IDailyLog, IDailyLogMethods>;

const DailyLogSchema = new Schema<IDailyLog, DailyLogModel, IDailyLogMethods>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        timezone: {
            type: String,
            required: true,
        },
        morning_weight: {
            type: Number,
            required: true,
        },
        energy_rating: {
            type: String,
            enum: energy_rating.values,
        },
        sleep_hours: {
            type: Number,
            required: true,
        },
        stress_level: {
            type: String,
            enum: stress_level.values,
        },
        meals: {
            type: [MealLogSchema],
        },
        hunger_events: {
            type: [HungerEventSchema],
        },
        craving_events: {
            type: [CravingEventSchema],
        },
        prediction: {
            type: PredictionSchema,
        },
        compliance: {
            type: ComplianceSchema,
        }
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
        methods: {
            // methods for craving events
            getCravingEventByTime(this: HydratedDailyLog, date: Date) {
                const found = this.craving_events.find((e: ICravingEvent) => e.occurred_at.getTime() === date.getTime());
                return found || null;
            },

            getCravingEvent(this: HydratedDailyLog, id: Types.ObjectId) {
                const found = this.craving_events.find((e: ICravingEvent) => e._id.equals(id));
                return found || null;
            },

            async addCravingEvent(this: HydratedDailyLog, event: ICravingEvent) {
                const existingEvent = this.getCravingEventByTime(event.occurred_at);
                if (existingEvent) {
                    return null;
                }
                this.craving_events.push(event);
                await this.save();
                return this;
            },

            async updateCravingEvent(this: HydratedDailyLog, id: Types.ObjectId, updates: Partial<ICravingEvent>) {
                const event = this.getCravingEvent(id);
                if (!event) {
                    return null;
                }
                Object.assign(event, updates);
                await this.save();
                return event;
            },

            async deleteCravingEvent(this: HydratedDailyLog, id: Types.ObjectId) {
                const idx = this.craving_events.findIndex((e: ICravingEvent) => e._id.equals(id));
                if (idx === -1) {
                    return false;
                }
                this.craving_events.splice(idx, 1);
                await this.save();
                return true;
            },
            
            getHungerEventByTime(this: HydratedDailyLog, date: Date) {
                const found = this.hunger_events.find((e: IHungerEvent) => e.occurred_at.getTime() === date.getTime());
                return found || null;
            },

            getHungerEvent(this: HydratedDailyLog, id: Types.ObjectId) {
                const found = this.hunger_events.find((e: IHungerEvent) => e._id.equals(id));
                return found || null;
            },

            async addHungerEvent(this: HydratedDailyLog, event: IHungerEvent) {
                if (this.getHungerEventByTime(event.occurred_at)) {
                    return null;
                }
                this.hunger_events.push(event);
                await this.save();
                return this;
            },
        
            async updateHungerEvent(this: HydratedDailyLog, id: Types.ObjectId, updates: Partial<IHungerEvent>) {
                const ev = this.getHungerEvent(id);
                if (!ev) {
                    return null;
                }
                Object.assign(ev, updates);
                await this.save();
                return ev;
            },

            async deleteHungerEvent(this: HydratedDailyLog, id: Types.ObjectId) {
                const idx = this.hunger_events.findIndex((e: IHungerEvent) => e._id.equals(id));
                if (idx === -1) {
                    return false;
                }
                this.hunger_events.splice(idx, 1);
                await this.save();
                return true;
            },
        },
        statics: {

            async getDailyLogByDate(user_id: Types.ObjectId, date: Date): Promise<HydratedDailyLog | null> {
                const dayStart = startOfDay(date);
                return await this.findOne({ user_id, date: dayStart }).exec();
            },

            async hasDailyLog(user_id: Types.ObjectId, date: Date): Promise<boolean> {
                const dayStart = startOfDay(date);
                const log = await this.findOne({ user_id, date: dayStart }).exec();
                return !!log;
            },

            async createDailyLog(user_id: Types.ObjectId, {
                date,
                timezone,
                morning_weight,
                energy_rating,
                sleep_hours,
                stress_level
            }: DailyLogValues): Promise<HydratedDailyLog> {
                const dayStart = startOfDay(date);

                const dailyLog = this.create({
                    user_id,
                    date: dayStart,
                    timezone,
                    morning_weight,
                    energy_rating,
                    sleep_hours,
                    stress_level
                });

                return dailyLog;
            }

        }
    }
);

DailyLogSchema.index(
    { user_id: 1, date: 1 },
    { unique: true }
);

export const DailyLog =
    (mongoose.models["Daily_Log"] as DailyLogModel) ||
    mongoose.model<IDailyLog, DailyLogModel>("Daily_Log", DailyLogSchema);
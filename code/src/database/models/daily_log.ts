import { ICravingEvent, IDailyLog, IHungerEvent } from "@/lib/types/mongo_daily_log_types";
import { craving_intensity_enum, craving_triggers_enum, craving_type_enum, DailyLogValues, energy_rating_enum, hunger_level_enum, meal_type_enum, stress_level_enum } from "@/lib/zod_schemas/health_schema";
import { startOfDay } from "date-fns";
import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";

const MealLogSchema = new Schema(
    {
        meal_type: {
            type: String,
            enum: meal_type_enum,
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

const HungerEventSchema = new Schema(
    {
        occurred_at: {
            type: Date,
            required: true,
        },
        hunger_level: {
            type: String,
            enum: hunger_level_enum,
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

const CravingEventSchema = new Schema(
    {
        occurred_at: {
            type: Date,
            required: true,
        },
        craving_type: {
            type: String,
            enum: craving_type_enum,
            required: true,
        },
        intensity: {
            type: String,
            enum: craving_intensity_enum,
            required: true,
        },
        trigger: {
            type: String,
            enum: craving_triggers_enum,
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

const PredictionSchema = new Schema(
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

const ComplianceSchema = new Schema(
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

const DailyLogSchema = new Schema(
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
            enum: energy_rating_enum,
        },
        sleep_hours: {
            type: Number,
            required: true,
        },
        stress_level: {
            type: String,
            stress_level_enum: stress_level_enum,
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
    }
);

DailyLogSchema.index(
    { user_id: 1, date: 1 },
    { unique: true }
);

//Methods Interface
export interface IDailyLogMethods {
    getCravingEventByTime(date: Date): ICravingEvent | null;
    getCravingEvent(id: Types.ObjectId): ICravingEvent | null;
    addCravingEvent(event: ICravingEvent): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    updateCravingEvent(id: Types.ObjectId, updates: Partial<ICravingEvent>): Promise<ICravingEvent | null>;
    deleteCravingEvent(id: Types.ObjectId): Promise<boolean>;

    getHungerEventByTime(date: Date): IHungerEvent | null;
    getHungerEvent(id: Types.ObjectId): IHungerEvent | null;
    addHungerEvent(event: IHungerEvent): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    updateHungerEvent(id: Types.ObjectId, updates: Partial<IHungerEvent>): Promise<IHungerEvent | null>;
    deleteHungerEvent(id: Types.ObjectId): Promise<boolean>;
}

//Model Interface, which includes both the document and the methods
export interface DailyLogModel extends Model<IDailyLog, {}, IDailyLogMethods> {
    hasDailyLog(user_id: Types.ObjectId, date: Date): Promise<boolean>;
    createDailyLog(user_id: Types.ObjectId, data: DailyLogValues): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    getDailyLogByDate(user_id: Types.ObjectId, date: Date): Promise<HydratedDocument<IDailyLog, IDailyLogMethods> | null>;
}

DailyLogSchema.statics.getDailyLogByDate = async function (user_id: Types.ObjectId, date: Date): Promise<HydratedDocument<IDailyLog, IDailyLogMethods> | null> {
    const dayStart = startOfDay(date);
    return await this.findOne({ user_id, date: dayStart }).exec();
}

DailyLogSchema.statics.hasDailyLog = async function (user_id: Types.ObjectId, date: Date): Promise<boolean> {
    const dayStart = startOfDay(date);
    const log = await this.findOne({ user_id, date: dayStart }).exec();
    return !!log;
}

DailyLogSchema.statics.createDailyLog = async function (user_id: Types.ObjectId, {
    date,
    timezone,
    morning_weight,
    energy_rating,
    sleep_hours,
    stress_level
}: DailyLogValues): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>> {
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
};

// methods for craving events
DailyLogSchema.methods.getCravingEventByTime = function (date: Date) {
    const found = this.craving_events.find((e: ICravingEvent) => e.occurred_at.getTime() === date.getTime());
    return found || null;
}

DailyLogSchema.methods.getCravingEvent = function (id: Types.ObjectId) {
    const found = this.craving_events.find((e: ICravingEvent) => e._id.equals(id));
    return found || null;
};

DailyLogSchema.methods.addCravingEvent = async function (event: ICravingEvent) {
    const existingEvent = this.getCravingEvent(event.occurred_at);
    if (existingEvent) {
        return null;
    }
    this.craving_events.push(event);
    await this.save();
    return this;
};

DailyLogSchema.methods.updateCravingEvent = async function (id: Types.ObjectId, updates: Partial<ICravingEvent>) {
    const event = this.getCravingEvent(id);
    if (!event) {
        return null;
    }
    Object.assign(event, updates);
    await this.save();
    return event;
};

DailyLogSchema.methods.deleteCravingEvent = async function (id: Types.ObjectId) {
    const idx = this.craving_events.findIndex((e: ICravingEvent) => e._id.equals(id));
    if (idx === -1) {
        return false;
    }
    this.craving_events.splice(idx, 1);
    await this.save();
    return true;
};

// hunger event helpers
DailyLogSchema.methods.getHungerEventByTime = function (date: Date) {
    const found = this.hunger_events.find((e: IHungerEvent) => e.occurred_at.getTime() === date.getTime());
    return found || null;
}

DailyLogSchema.methods.getHungerEvent = function (id: Types.ObjectId) {
    const found = this.hunger_events.find((e: IHungerEvent) => e._id.equals(id));
    return found || null;
};

DailyLogSchema.methods.addHungerEvent = async function (event: IHungerEvent) {
    if (this.getHungerEvent(event.occurred_at)) {
        return null;
    }
    this.hunger_events.push(event);
    await this.save();
    return this;
};

DailyLogSchema.methods.updateHungerEvent = async function (id: Types.ObjectId, updates: Partial<IHungerEvent>) {
    const ev = this.getHungerEvent(id);
    if (!ev) {
        return null;
    }
    Object.assign(ev, updates);
    await this.save();
    return ev;
};

DailyLogSchema.methods.deleteHungerEvent = async function (id: Types.ObjectId) {
    const idx = this.hunger_events.findIndex((e: IHungerEvent) => e._id.equals(id));
    if (idx === -1) {
        return false;
    }
    this.hunger_events.splice(idx, 1);
    await this.save();
    return true;
};

export const DailyLog =
    (mongoose.models["Daily_Log"] as DailyLogModel) ||
    mongoose.model<IDailyLog, DailyLogModel>("Daily_Log", DailyLogSchema);
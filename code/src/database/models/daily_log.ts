import { craving_intensity_enum, craving_triggers_enum, craving_type_enum, CravingIntensity, CravingTrigger, CravingType, DailyLogValues, energy_rating_enum, EnergyRating, hunger_level_enum, HungerLevel, meal_type_enum, MealType, stress_level_enum, StressLevel } from "@/lib/zod_schemas/health_schema";
import mongoose, { Schema, Document, Model, Types, HydratedDocument } from "mongoose";

export interface IDailyLog {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    date: Date;
    morning_weight: number;
    energy_rating: EnergyRating;
    sleep_hours: number;
    stress_level: StressLevel;
    meals: IMealLog[];
    hunger_events: IHungerEvent[];
    craving_events: ICravingEvent[];
    prediction: IPrediction;
    compliance: ICompliance;
}

export interface IMealLog {
    meal_type: MealType;
    description: string;
    calories: number;
}

export interface IHungerEvent {
    occurred_at: Date;
    hunger_level: HungerLevel;
    suggested_actions: string[];
    reasoning: string;
}

export interface ICravingEvent {
    occurred_at: Date;
    craving_type: CravingType;
    intensity: CravingIntensity;
    trigger: CravingTrigger;
    suggested_actions: string[];
    reasoning: string;
}

export interface IPrediction {
    appetite_risk_score: number; // 1-10 scale
    over_eating_risk_probability: number;
    weight_loss_success_probability: number;
    projected_timeline_days: number;
}

export interface ICompliance {
    commitment_rate: number; // 1-10 scale
    portion_control_score: number; // 1-10 scale
    consistency_score: number; // 1-10 scale
}

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
    },
    { _id: false }
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
    },
    { _id: false }
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
    getCravingEvent(occurred_at: Date): ICravingEvent | null;
    addCravingEvent(event: ICravingEvent): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    updateCravingEvent(occurred_at: Date, updates: Partial<ICravingEvent>): Promise<ICravingEvent | null>;
    deleteCravingEvent(occurred_at: Date): Promise<boolean>;
    getHungerEvent(occurred_at: Date): IHungerEvent | null;
    addHungerEvent(event: IHungerEvent): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    updateHungerEvent(occurred_at: Date, updates: Partial<IHungerEvent>): Promise<IHungerEvent | null>;
    deleteHungerEvent(occurred_at: Date): Promise<boolean>;
}

//Model Interface, which includes both the document and the methods
export interface DailyLogModel extends Model<IDailyLog, {}, IDailyLogMethods> {
    hasDailyLog(user_id: Types.ObjectId, date: Date): Promise<boolean>;
    createDailyLog(user_id: Types.ObjectId, data: DailyLogValues): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>>;
    getDailyLogByDate(user_id: Types.ObjectId, date: Date): Promise<HydratedDocument<IDailyLog, IDailyLogMethods> | null>;
}

DailyLogSchema.statics.getDailyLogByDate = async function (user_id: Types.ObjectId, date: Date): Promise<HydratedDocument<IDailyLog, IDailyLogMethods> | null> {
    
    //normalize date to midnight
    date.setUTCHours(0, 0, 0, 0);

    return await this.findOne({ user_id, date }).exec();
}

DailyLogSchema.statics.hasDailyLog = async function (user_id: Types.ObjectId, date: Date): Promise<boolean> {
    
    //normalize date to midnight
    date.setUTCHours(0, 0, 0, 0);

    const log = await this.findOne({ user_id, date }).exec();
    return !!log;
}

DailyLogSchema.statics.createDailyLog = async function (user_id: Types.ObjectId, {
    date,
    morning_weight,
    energy_rating,
    sleep_hours,
    stress_level
}: DailyLogValues): Promise<HydratedDocument<IDailyLog, IDailyLogMethods>> {

    //normalize date to midnight
    date.setUTCHours(0, 0, 0, 0);

    const dailyLog = this.create({
        user_id,
        date,
        morning_weight,
        energy_rating,
        sleep_hours,
        stress_level
    });

    return dailyLog;
};

// methods for craving events
DailyLogSchema.methods.getCravingEvent = function (occurred_at: Date) {
    const found = this.craving_events.find((e: ICravingEvent) => {
        return e.occurred_at.getTime() === occurred_at.getTime()
    });
    console.log(found);
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

DailyLogSchema.methods.updateCravingEvent = async function (occurred_at: Date, updates: Partial<ICravingEvent>) {
    const event = this.getCravingEvent(occurred_at);
    if (!event) {
        return null;
    }
    Object.assign(event, updates);
    await this.save();
    return event;
};

DailyLogSchema.methods.deleteCravingEvent = async function (occurred_at: Date) {
    const idx = this.craving_events.findIndex((e: ICravingEvent) => e.occurred_at.getTime() === occurred_at.getTime());
    if (idx === -1) {
        return false;
    }
    this.craving_events.splice(idx, 1);
    await this.save();
    return true;
};

// hunger event helpers
DailyLogSchema.methods.getHungerEvent = function (occurred_at: Date) {
    const found = this.hunger_events.find((e: IHungerEvent) => e.occurred_at.getTime() === occurred_at.getTime());
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

DailyLogSchema.methods.updateHungerEvent = async function (occurred_at: Date, updates: Partial<IHungerEvent>) {
    const ev = this.getHungerEvent(occurred_at);
    if (!ev) {
        return null;
    }
    Object.assign(ev, updates);
    await this.save();
    return ev;
};

DailyLogSchema.methods.deleteHungerEvent = async function (occurred_at: Date) {
    const idx = this.hunger_events.findIndex((e: IHungerEvent) => e.occurred_at.getTime() === occurred_at.getTime());
    if (idx === -1) {
        return false;
    }
    this.hunger_events.splice(idx, 1);
    await this.save();
    return true;
};

export const DailyLog =
    (mongoose.models.DailyLog as DailyLogModel) ||
    mongoose.model<IDailyLog, DailyLogModel>("Daily_Log", DailyLogSchema);
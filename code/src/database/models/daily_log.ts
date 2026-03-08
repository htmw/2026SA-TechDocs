import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDailyLog {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    date: Date;
    morning_weight: number;
    energy_rating: number; // 1-10 scale
    sleep_hours: number;
    stress_level: number; // 1-10 scale
    meals: IMealLog[];
    hunger_events: IHungerEvent[];
    craving_events: ICravingEvent[];
    prediction: IPrediction;
    compliance: ICompliance;
}

export interface IMealLog {
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    description: string;
    calories: number;
}

export interface IHungerEvent {
    occurred_at: Date;
    hunger_level: number; // 1-10 scale
    suggested_actions: string[];
    reasoning: string;
}

export interface ICravingEvent {
    occurred_at: Date;
    craving_type: string; // "sweet", "salty", "savory", etc.
    intensity: number; // 1-10 scale
    trigger: string; // "stress", "boredom", etc.
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
            enum: ["breakfast", "lunch", "dinner", "snack"],
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
            type: Number,
            min: 1,
            max: 10,
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
            required: true,
        },
        intensity: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        trigger: {
            type: String,
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

const DailyLogSchema = new Schema({
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
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    sleep_hours: {
        type: Number,
        required: true,
    },
    stress_level: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
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
    },
});

//Methods Interface
export interface IDailyLogMethods {
    
}

//Model Interface, which includes both the document and the methods
export interface DailyLogModel extends Model<IDailyLog, {}, IDailyLogMethods> {
    
}

export interface IDailyLogDocument extends IDailyLog, Document {
    
}

export const DailyLogModel = mongoose.model<IDailyLogDocument>("DailyLog", DailyLogSchema);
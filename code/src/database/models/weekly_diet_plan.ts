import { Model, Schema, Types, model } from 'mongoose';

export interface IWeeklyDietPlan {
    user_id: Types.ObjectId;
    week_start: Date;
    meals: IMealPlan[];
}

export interface IMealPlan {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
}

//Methods Interface
export interface IWeeklyDietPlanMethods {
    
}

//Model Interface, which includes both the document and the methods
export interface WeeklyDietPlanModel extends Model<IWeeklyDietPlan, {}, IWeeklyDietPlanMethods> {
    
}

export const WeeklyDietPlanSchema = new Schema<IWeeklyDietPlan, WeeklyDietPlanModel, IWeeklyDietPlanMethods>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        week_start: {
            type: Date,
            required: true,
        },
        meals: [
            {
                day: {
                    type: String,
                    required: true,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                },
                breakfast: {
                    type: String,
                    required: true,
                },
                lunch: {
                    type: String,
                    required: true,
                },
                dinner: {
                    type: String,
                    required: true,
                },
                snacks: {
                    type: String,
                },
            },
        ],
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

export const WeeklyDietPlan = model<IWeeklyDietPlan>('WeeklyDietPlan', WeeklyDietPlanSchema);
// code/src/database/models/chat_rule.ts

import mongoose, { models, Schema, Types } from "mongoose";

// Defines one saved chat rule.
export interface IChatRule {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    rule: string;
    createdAt: Date;
    updatedAt: Date;
}

// Stores chat rules by user.
const chatRuleSchema = new Schema<IChatRule>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rule: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Reuses model if already created.
export const ChatRule =
    models.ChatRule || mongoose.model<IChatRule>("ChatRule", chatRuleSchema);
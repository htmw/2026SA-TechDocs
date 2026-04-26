// code/src/database/models/chat_message.ts

import mongoose, { models, Schema, Types } from "mongoose";

// Defines one chat message.
export interface IChatMessage {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Stores chat messages by user.
const chatMessageSchema = new Schema<IChatMessage>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000,
        },
    },
    {
        timestamps: true,
    }
);

// Reuses model if created.
export const ChatMessage =
    models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
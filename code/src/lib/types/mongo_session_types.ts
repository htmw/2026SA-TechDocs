import { ToPrimitive } from "@/lib/types/mongo_primitive_types";
import { Types } from "mongoose";

export interface ISession {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    session_id: string;
    expires_at: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ClientSession = ToPrimitive<ISession>;
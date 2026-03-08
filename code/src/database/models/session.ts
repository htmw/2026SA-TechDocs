import { IUserMethods, User } from "@/database/models/user";
import { ISession } from "@/lib/types/mongo_session_types";
import { IUser } from "@/lib/types/mongo_user_types";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

const EXTEND_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const NEW_TTL_MS = 1000 * 60 * 60 * 24 * 30;  // 30 days

//Methods Interface
export interface ISessionMethods {

}

//Model Interface, which includes both the document and the methods
export interface SessionModel extends Model<ISession, {}, ISessionMethods> {
    createSession(token: string, user_id: Types.ObjectId): Promise<HydratedDocument<ISession, ISessionMethods>>;
    validateSessionToken(token: string): Promise<{ session: HydratedDocument<ISession, ISessionMethods>, user: HydratedDocument<IUser, IUserMethods> } | null>;
    invalidateSession(id: Types.ObjectId | string): Promise<boolean>;
}

const SessionSchema = new Schema<ISession, SessionModel, ISessionMethods>(
    {
        user_id: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            trim: true,
        },
        session_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt fields
    }
);

SessionSchema.statics.validateSessionToken = async function (token: string): Promise<{ session: HydratedDocument<ISession, ISessionMethods>, user: HydratedDocument<IUser, IUserMethods> } | null> {
    const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    // get session
    const sess = await this.findOne({ session_id }).exec();
    if (!sess) {
        return null;
    }

    const now = Date.now();
    const exp = new Date(sess.expires_at).getTime();

    // if expired, remove and return null
    if (now >= exp) {
        await this.invalidateSession(sess._id);
        return null;
    }

    // fetch user
    const user_doc = await User.findByUserId(sess.user_id);

    //user not found, invalidate dangling session and return null
    if (!user_doc) {
        await this.invalidateSession(sess._id);
        return null;
    }

    // extend if within threshold
    if (now >= exp - EXTEND_THRESHOLD_MS) {
        const newExpiresAt = new Date(now + NEW_TTL_MS);
        await this.findByIdAndUpdate(session_id, { expires_at: newExpiresAt }).exec();

        sess.expires_at = newExpiresAt;
    }

    return { session: sess, user: user_doc };
}

SessionSchema.statics.invalidateSession = async function (id: Types.ObjectId | string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return true;
    }
    return await this.findByIdAndDelete(id).exec().then(() => true as const)
};

SessionSchema.statics.createSession = async function (token: string, user_id: Types.ObjectId): Promise<HydratedDocument<ISession, ISessionMethods>> {
    const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    const expires_at = new Date(Date.now() + NEW_TTL_MS);

    const session = this.create({
        session_id,
        user_id,
        expires_at
    });

    return session;
}

export const Session =
    (mongoose.models.Session as SessionModel) ||
    mongoose.model<ISession, SessionModel>("Session", SessionSchema);
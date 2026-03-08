import { Types } from "mongoose";

export function normalizeDocument<T>(input: any): T {
    if (input == null) return input;

    //convert object id to string
    if (input instanceof Types.ObjectId) {
        return input.toString() as any;
    }

    //convert date to iso string
    if (input instanceof Date) {
        return new Date(input).toISOString() as any;
    }

    //if array nromalize each item
    if (Array.isArray(input)) {
        return input.map((item) => normalizeDocument(item)) as any;
    }

    //if document has mongo properties, convert it to plain text
    if (isMongooseDoc(input)) {
        input = input.toObject({ getters: false, virtuals: false });
    }

    if (isPlainObject(input)) {
        const output: Record<string, any> = {};
        for (const [key, value] of Object.entries(input)) {
            //Remove mongodb fields
            if (key === "__v" || key === "$__" || key === "$isSingleNested") continue;

            output[key] = normalizeDocument(value);
        }
        return output as T;
    }

    return input;
}

function isPlainObject(v: any): v is Record<string, any> {
    return Object.prototype.toString.call(v) === "[object Object]";
}

function isMongooseDoc(v: any): boolean {
    return v && typeof v === "object" && v.$__ != null;
}

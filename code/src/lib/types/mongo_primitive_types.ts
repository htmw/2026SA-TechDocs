import { Types } from "mongoose";

export type ToPrimitive<T> = {
    [K in keyof T]:
    T[K] extends Types.ObjectId ? string :
    T[K] extends Date ? string :
    T[K] extends Buffer ? string :
    T[K] extends (infer U)[] ? ToPrimitive<U>[] :
    T[K] extends object ? ToPrimitive<T[K]> :
    T[K];
};
// code/src/instrumentation.ts

export async function register() {
    // Mongoose should not be connected from instrumentation.
    // Server routes and server actions should call getMongoose before using MongoDB.
    return;
}
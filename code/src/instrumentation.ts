import { getMongoose } from "@/lib/mongoose_connector";

export async function register() {    
    try {
        await getMongoose();
        console.log("Mongoose Connected");
    } catch (e) {
        console.error("Failed to start Mongoose:", e);
    }
}
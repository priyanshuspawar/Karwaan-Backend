import mongoose from "mongoose";
import Logger from "../utils/Logger";

export const connectDB = async (MONGO_URI: string | undefined) => {
    try {
        if(!MONGO_URI){
            return Logger.error("Invalid or missing MONGO URI");
        }

        await mongoose.connect(MONGO_URI);
        return Logger.info(" 💾 Successfully connected to the database");
    } catch (error) {
        console.log(error);
        throw error;
    }
}
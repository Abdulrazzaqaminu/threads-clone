import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set("strictQuery", true);

    if(!process.env.MONGODB_URI) return console.log("MONGODB_URI not found");
    if(isConnected) return console.log("Already connected to MongoDB");

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
}
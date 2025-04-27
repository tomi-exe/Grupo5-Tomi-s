import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri, {
      dbName: "prograpro",
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

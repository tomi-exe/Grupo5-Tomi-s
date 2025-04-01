import mongoose from "mongoose";

let isConnected = false; // Track the connection status

export async function connectToDB() {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    const uri = process.env.MONGODB_URI; // Ensure this environment variable is set
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri, {
      dbName: "prograpro", // Replace with your actual database name
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export function getDB() {
  if (!isConnected) {
    throw new Error("Database is not connected. Call connectToDB first.");
  }
  return mongoose.connection.db;
}

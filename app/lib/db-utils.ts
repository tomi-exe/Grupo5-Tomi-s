import mongoose from "mongoose";

// Estado de conexión global
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    cached.promise = mongoose.connect(uri, {
      dbName: "prograpro",
      ...opts,
    }).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Función para limpiar modelos en desarrollo
export function clearModels() {
  if (process.env.NODE_ENV === 'development') {
    // Limpiar cache de modelos en desarrollo
    Object.keys(mongoose.models).forEach(modelName => {
      delete mongoose.models[modelName];
    });
  }
}

// Función para reconectar si es necesario
export async function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    await connectToDB();
  }
}
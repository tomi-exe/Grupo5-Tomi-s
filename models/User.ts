import mongoose from "mongoose";

// Interface para el modelo User
interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  rut: string;
  role?: "user" | "admin";
}

interface IUserModel extends mongoose.Model<IUser> {}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  rut: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, { timestamps: true });

// Usar la sintaxis correcta para evitar el error de overwrite
const User = (mongoose.models.User as IUserModel) || 
  mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
export type { IUser, IUserModel };
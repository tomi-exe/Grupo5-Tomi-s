import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  rut: { type: String, required: true, unique: true }, // Nuevo campo para el RUT
});

const User = mongoose.models.User || mongoose.model("User1", UserSchema);

export default User;

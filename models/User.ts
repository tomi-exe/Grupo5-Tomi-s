import mongoose from "mongoose";

// Define the schema for the User model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

// Export the User model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

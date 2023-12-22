import mongoose from "mongoose";
import bCrypt from "bcryptjs";
const { Schema } = mongoose;

const UserSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  firstname: {
    type: String,
    required: [true, "First name is required"],
  },
  token: {
    type: String,
    default: null,
  },
  balance: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verification token is required"],
  },
});

UserSchema.methods.setPassword = async function (password) {
  try {
    const salt = await bCrypt.genSalt(6);
    this.password = await bCrypt.hash(password, salt);
  } catch (error) {
    console.error("Error setting password:", error.message);
    throw new Error("Error setting password");
  }
};

UserSchema.methods.validPassword = async function (password) {
  try {
    return await bCrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error.message);
    return false;
  }
};

const User = mongoose.model("users", UserSchema);
export default User;

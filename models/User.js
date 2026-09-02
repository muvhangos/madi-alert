import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

export default User;
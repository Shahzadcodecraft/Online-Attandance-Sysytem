import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, default: null },
    machineCode: { type: String, default: null, index: true },
    faceId: { type: String, required: true, index: true },
    imageBucket: { type: String, required: true },
    imageKey: { type: String, required: true },
  },
  { timestamps: true, collection: "users" },
);

export const UserModel = mongoose.model("User", userSchema);

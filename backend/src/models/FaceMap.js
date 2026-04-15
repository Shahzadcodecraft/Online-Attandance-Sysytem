import mongoose from "mongoose";

const faceMapSchema = new mongoose.Schema(
  {
    faceId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: "face_maps" },
);

export const FaceMapModel = mongoose.model("FaceMap", faceMapSchema);

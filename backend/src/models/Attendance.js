import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: null },
  },
  { timestamps: true, collection: "attendance" },
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.model("Attendance", attendanceSchema);

import { AttendanceModel } from "../models/Attendance.js";

function nowIso() {
  return new Date().toISOString();
}

function currentDateKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function markAttendance(user) {
  const date = currentDateKey();
  const timestamp = nowIso();
  const query = { userId: user.userId, date };

  const existing = await AttendanceModel.findOne(query).lean();

  if (!existing) {
    const created = await AttendanceModel.create({
      ...query,
      userName: user.userId,
      checkIn: timestamp,
      checkOut: null,
    });

    return {
      action: "check-in",
      attendance: created.toObject(),
      message: "Attendance marked: check-in",
    };
  }

  if (!existing.checkOut) {
    const updated = await AttendanceModel.findOneAndUpdate(
      query,
      { checkOut: timestamp },
      { new: true },
    ).lean();

    return {
      action: "check-out",
      attendance: updated,
      message: "Attendance marked: check-out",
    };
  }

  return {
    action: "check-out",
    attendance: existing,
    message: "Attendance already completed for today",
  };
}

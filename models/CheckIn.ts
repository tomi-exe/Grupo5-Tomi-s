import mongoose from "mongoose";

const CheckInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    checkInDate: { type: Date, default: () => new Date() },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "duplicate"],
      default: "success",
    },
  },
  { timestamps: true }
);

// 🔑 Índice único para evitar duplicados por ticket+evento
CheckInSchema.index({ ticketId: 1, eventId: 1 }, { unique: true });

export default mongoose.models.CheckIn
  ? mongoose.model("CheckIn")
  : mongoose.model("CheckIn", CheckInSchema);
//

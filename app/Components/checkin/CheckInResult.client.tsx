import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true },
    currentAttendees: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Event = mongoose.models.Event
  ? mongoose.model("Event")
  : mongoose.model("Event", EventSchema);

export default Event;

import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  currentAttendees: { type: Number, default: 0 },
});

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;

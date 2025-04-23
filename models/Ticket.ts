import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  event: { type: String, required: true },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);

export default Ticket;


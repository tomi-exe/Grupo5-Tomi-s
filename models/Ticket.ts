import mongoose from "mongoose";

// Definición del esquema de Ticket con campos para reventa
const TicketSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    price: { type: Number, required: true },
    disp: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forSale: { type: Boolean, default: false },
    transferDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Ticket = mongoose.models.Ticket
  ? mongoose.model("Ticket", TicketSchema)
  : mongoose.model("Ticket", TicketSchema);

export default Ticket;

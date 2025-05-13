import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    price: { type: Number, required: true },
    disp: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// 🔥 Fuerza recrear el modelo si ya existe en desarrollo
const Ticket = mongoose.models.Ticket
  ? mongoose.deleteModel("Ticket") && mongoose.model("Ticket", TicketSchema)
  : mongoose.model("Ticket", TicketSchema);

export default Ticket;




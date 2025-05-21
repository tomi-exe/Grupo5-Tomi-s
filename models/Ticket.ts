import mongoose from "mongoose";

// Definición del esquema de Ticket con campos para reventa
const TicketSchema = new mongoose.Schema(
  {
    // Nombre del evento
    eventName: { type: String, required: true },
    // Fecha y hora del evento
    eventDate: { type: Date, required: true },
    // Precio de la entrada
    price: { type: Number, required: true },
    // Cantidad disponible (stock)
    disp: { type: Number, required: true },
    // Usuario propietario o creador del ticket
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Indica si el ticket está activo en el mercado de reventa
    forSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Evita recompilar el modelo en desarrollo si ya existe
const Ticket = mongoose.models.Ticket
  ? mongoose.model("Ticket", TicketSchema)
  : mongoose.model("Ticket", TicketSchema);

export default Ticket;

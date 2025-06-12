import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    // Datos del evento
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },

    // Precio y disponibilidad
    price: { type: Number, required: true },
    disp: { type: Number, required: true },

    // Propietarios
    userId: {
      // Propietario original (nunca cambia)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentOwnerId: {
      // Propietario actual (se actualiza en cada transferencia)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Estado de reventa / venta
    forSale: { type: Boolean, default: false },
    transferDate: { type: Date, default: null },

    // Check-in y uso
    isUsed: { type: Boolean, default: false },
    checkInDate: { type: Date, default: null },

    sold: { type: Boolean, default: false },

    // Auditoría
    purchaseDate: { type: Date, default: Date.now },
    lastTransferDate: { type: Date, default: null },
    transferCount: { type: Number, default: 0 },

    // Metadatos
    originalPrice: { type: Number },
    qrCode: { type: String, unique: true, required: true },

    // Estado general
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// 🔑 Pre-save: actualizar transferCount, fechas y precios
TicketSchema.pre("save", function (next) {
  // Si cambió de dueño (no es nuevo), actualizar contador y fecha
  if (this.isModified("currentOwnerId") && !this.isNew) {
    this.transferCount = (this.transferCount || 0) + 1;
    this.lastTransferDate = new Date();
  }

  // Si es nuevo y no tiene currentOwnerId, ponerlo igual a userId
  if (this.isNew && !this.currentOwnerId) {
    this.currentOwnerId = this.userId;
  }

  // Si es nuevo y no tiene originalPrice, fijarlo al precio inicial
  if (this.isNew && !this.originalPrice) {
    this.originalPrice = this.price;
  }

  next();
});

// 📈 Índices para consultas rápidas
TicketSchema.index({ userId: 1, eventDate: -1 });
TicketSchema.index({ currentOwnerId: 1, eventDate: -1 });
TicketSchema.index({ forSale: 1, eventDate: 1 });
TicketSchema.index({ eventName: "text" });
TicketSchema.index({ status: 1, eventDate: 1 });

// 🔮 Virtuals
TicketSchema.virtual("isTransferred").get(function () {
  return this.transferCount > 0;
});
TicketSchema.virtual("daysSincePurchase").get(function () {
  return Math.floor(
    (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// 🚀 Métodos estáticos
TicketSchema.statics.findByCurrentOwner = function (ownerId: string) {
  return this.find({ currentOwnerId: ownerId });
};
TicketSchema.statics.findForSale = function () {
  return this.find({ forSale: true, status: "active" });
};

// 🛠 Métodos de instancia
TicketSchema.methods.transferTo = function (newOwnerId: string) {
  this.currentOwnerId = newOwnerId;
  this.forSale = false;
  this.transferDate = new Date();
  return this.save();
};
TicketSchema.methods.putForSale = function (salePrice?: number) {
  this.forSale = true;
  if (salePrice != null) this.price = salePrice;
  return this.save();
};
TicketSchema.methods.removeFromSale = function () {
  this.forSale = false;
  return this.save();
};
TicketSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  this.status = "used";
  this.forSale = false;
  return this.save();
};

const Ticket = mongoose.models.Ticket
  ? mongoose.model("Ticket")
  : mongoose.model("Ticket", TicketSchema);

export default Ticket;

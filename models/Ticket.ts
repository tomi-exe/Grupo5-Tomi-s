import mongoose from "mongoose";

// Interfaces para tipado TypeScript
interface ITicket extends mongoose.Document {
  eventName: string;
  eventDate: Date;
  price: number;
  disp: number;
  userId: mongoose.Types.ObjectId;
  currentOwnerId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId; // Nuevo campo para referenciar el evento
  forSale: boolean;
  transferDate?: Date | null;
  isUsed: boolean;
  sold: boolean;
  purchaseDate: Date;
  lastTransferDate?: Date | null;
  transferCount: number;
  originalPrice?: number;
  qrCode?: string;
  status: "active" | "used" | "expired" | "cancelled";
  checkInDate?: Date | null; // Nueva fecha de check-in

  // Virtuals
  isTransferred: boolean;
  daysSincePurchase: number;
  canCheckIn: boolean;

  // Methods
  transferTo(newOwnerId: string | mongoose.Types.ObjectId): Promise<ITicket>;
  putForSale(salePrice?: number): Promise<ITicket>;
  removeFromSale(): Promise<ITicket>;
  markAsUsed(): Promise<ITicket>;
  processCheckIn(): Promise<ITicket>;
}

interface ITicketModel extends mongoose.Model<ITicket> {
  findByCurrentOwner(
    ownerId: string | mongoose.Types.ObjectId
  ): mongoose.Query<ITicket[], ITicket>;
  findForSale(): mongoose.Query<ITicket[], ITicket>;
  findByEvent(eventName: string): mongoose.Query<ITicket[], ITicket>;
  getEventTicketStats(eventName: string): Promise<any>;
}

// Definición del esquema de Ticket actualizado
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
    eventId: {
      // Referencia al evento (para control de aforo)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    forSale: { type: Boolean, default: false },
    transferDate: { type: Date, default: null },
    isUsed: { type: Boolean, default: false },
    sold: { type: Boolean, default: false },

    // Campos adicionales para auditoría
    purchaseDate: { type: Date, default: Date.now },
    lastTransferDate: { type: Date, default: null },
    transferCount: { type: Number, default: 0 },

    // Metadatos adicionales
    originalPrice: { type: Number },
    qrCode: { type: String },

    // Estado del ticket
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
    },

    // Nueva fecha de check-in
    checkInDate: {
      type: Date,
      default: null,
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

  // Si se marca como usado, establecer checkInDate si no existe
  if (this.isModified("isUsed") && this.isUsed && !this.checkInDate) {
    this.checkInDate = new Date();
  }

  next();
});

// 📈 Índices para consultas rápidas
TicketSchema.index({ userId: 1, eventDate: -1 });
TicketSchema.index({ currentOwnerId: 1, eventDate: -1 });
TicketSchema.index({ forSale: 1, eventDate: 1 });
TicketSchema.index({ eventName: "text" });
TicketSchema.index({ status: 1, eventDate: 1 });
TicketSchema.index({ eventId: 1, status: 1 }); // Nuevo índice para eventos
TicketSchema.index({ checkInDate: -1 }); // Nuevo índice para check-ins

// 🔮 Virtuals
TicketSchema.virtual("isTransferred").get(function () {
  return this.transferCount > 0;
});
TicketSchema.virtual("daysSincePurchase").get(function () {
  return Math.floor(
    (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
});

TicketSchema.virtual("canCheckIn").get(function () {
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  const timeDiff = eventDate.getTime() - now.getTime();
  const hoursUntilEvent = timeDiff / (1000 * 60 * 60);

  return (
    this.status === "active" &&
    !this.isUsed &&
    hoursUntilEvent <= 4 && // Permitir check-in 4 horas antes
    hoursUntilEvent >= -2 // Permitir check-in hasta 2 horas después
  );
});

// Métodos estáticos
TicketSchema.statics.findByCurrentOwner = function (
  ownerId: string | mongoose.Types.ObjectId
) {
  return this.find({ currentOwnerId: ownerId });
};
TicketSchema.statics.findForSale = function () {
  return this.find({ forSale: true, status: "active" });
};

TicketSchema.statics.findByEvent = function (eventName: string) {
  return this.find({ eventName: new RegExp(eventName, "i") });
};

TicketSchema.statics.getEventTicketStats = async function (eventName: string) {
  const stats = await this.aggregate([
    { $match: { eventName: new RegExp(eventName, "i") } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$price" },
      },
    },
  ]);

  const totalTickets = await this.countDocuments({
    eventName: new RegExp(eventName, "i"),
  });

  const usedTickets = await this.countDocuments({
    eventName: new RegExp(eventName, "i"),
    isUsed: true,
  });

  const availableTickets = await this.countDocuments({
    eventName: new RegExp(eventName, "i"),
    status: "active",
    isUsed: false,
  });

  const ticketsForSale = await this.countDocuments({
    eventName: new RegExp(eventName, "i"),
    forSale: true,
    status: "active",
  });

  return {
    totalTickets,
    usedTickets,
    availableTickets,
    ticketsForSale,
    usagePercentage:
      totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0,
    statusBreakdown: stats,
  };
};

// Métodos de instancia
TicketSchema.methods.transferTo = function (
  newOwnerId: string | mongoose.Types.ObjectId
) {
  this.currentOwnerId = newOwnerId;
  this.forSale = false;
  this.transferDate = new Date();
  return this.save();
};

TicketSchema.methods.putForSale = function (salePrice?: number) {
  if (this.isUsed || this.status === "used") {
    throw new Error("No se puede poner en venta un ticket ya utilizado");
  }
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
  if (!this.checkInDate) {
    this.checkInDate = new Date();
  }
  return this.save();
};

TicketSchema.methods.processCheckIn = function () {
  if (this.isUsed || this.status === "used") {
    throw new Error("Este ticket ya ha sido utilizado");
  }

  if (!this.canCheckIn) {
    throw new Error("Este ticket no es elegible para check-in en este momento");
  }

  this.isUsed = true;
  this.status = "used";
  this.forSale = false;
  this.checkInDate = new Date();

  return this.save();
};

const Ticket =
  (mongoose.models.Ticket as ITicketModel) ||
  mongoose.model<ITicket, ITicketModel>("Ticket", TicketSchema);

export default Ticket;
export type { ITicket, ITicketModel };

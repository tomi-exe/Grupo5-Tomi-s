import mongoose from "mongoose";

// Interfaces para tipado TypeScript
interface ITransfer extends mongoose.Document {
  ticketId: mongoose.Types.ObjectId;
  eventName: string;
  eventDate: Date;
  previousOwnerId: mongoose.Types.ObjectId;
  previousOwnerEmail: string;
  previousOwnerName: string;
  newOwnerId: mongoose.Types.ObjectId;
  newOwnerEmail: string;
  newOwnerName: string;
  transferType: "direct_transfer" | "resale_purchase" | "admin_transfer";
  transferPrice?: number | null;
  transferDate: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  notes?: string | null;
  status: "completed" | "pending" | "failed";
}

interface ITransferModel extends mongoose.Model<ITransfer> {
  // Aquí puedes agregar métodos estáticos si los necesitas
}

// Definición del esquema de Transfer con campos para reventa
const TransferSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    previousOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousOwnerEmail: {
      type: String,
      required: true,
    },
    previousOwnerName: {
      type: String,
      required: true,
    },
    newOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    newOwnerEmail: {
      type: String,
      required: true,
    },
    newOwnerName: {
      type: String,
      required: true,
    },
    transferType: {
      type: String,
      enum: ["direct_transfer", "resale_purchase", "admin_transfer"],
      required: true,
    },
    transferPrice: {
      type: Number,
      default: null, // Solo para reventas
    },
    transferDate: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { 
    timestamps: true,
  }
);

// Índices para mejorar rendimiento en consultas de auditoría
TransferSchema.index({ ticketId: 1, transferDate: -1 });
TransferSchema.index({ previousOwnerId: 1, transferDate: -1 });
TransferSchema.index({ newOwnerId: 1, transferDate: -1 });
TransferSchema.index({ transferDate: -1 });
TransferSchema.index({ transferType: 1, transferDate: -1 });

const Transfer = (mongoose.models.Transfer as ITransferModel) || 
  mongoose.model<ITransfer, ITransferModel>("Transfer", TransferSchema);

export default Transfer;
export type { ITransfer, ITransferModel };
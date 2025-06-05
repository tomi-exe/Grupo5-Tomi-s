import mongoose from "mongoose";

// Esquema para el historial de transferencias
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
    // Índices para optimizar consultas de auditoría
  }
);

// Índices para mejorar rendimiento en consultas de auditoría
TransferSchema.index({ ticketId: 1, transferDate: -1 });
TransferSchema.index({ previousOwnerId: 1, transferDate: -1 });
TransferSchema.index({ newOwnerId: 1, transferDate: -1 });
TransferSchema.index({ transferDate: -1 });
TransferSchema.index({ transferType: 1, transferDate: -1 });

const Transfer = mongoose.models.Transfer || mongoose.model("Transfer", TransferSchema);

export default Transfer;
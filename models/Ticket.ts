import mongoose from "mongoose";

// Definición del esquema de Ticket con campos para reventa y auditoría
const TicketSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    price: { type: Number, required: true },
    disp: { type: Number, required: true },
    userId: { // Propietario original (nunca cambia)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentOwnerId: { // Propietario actual (se actualiza en cada transferencia)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forSale: { type: Boolean, default: false },
    transferDate: { type: Date, default: null },
    isUsed: { type: Boolean, default: false }, // Para marcar tickets ya utilizados
    sold: { type: Boolean, default: false }, // Indica si ya fue vendido
    
    // Campos adicionales para auditoría
    purchaseDate: { type: Date, default: Date.now }, // Fecha de compra original
    lastTransferDate: { type: Date, default: null }, // Última fecha de transferencia
    transferCount: { type: Number, default: 0 }, // Número de transferencias realizadas
    
    // Metadatos adicionales
    originalPrice: { type: Number }, // Precio original de compra
    qrCode: { type: String }, // Hash único para el QR
    
    // Estado del ticket
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active"
    }
  },
  { 
    timestamps: true,
    // Middleware para actualizar campos automáticamente
  }
);

// Middleware pre-save para actualizar campos automáticamente
TicketSchema.pre('save', function(next) {
  // Si currentOwnerId ha cambiado, actualizar transferCount y lastTransferDate
  if (this.isModified('currentOwnerId') && !this.isNew) {
    this.transferCount = (this.transferCount || 0) + 1;
    this.lastTransferDate = new Date();
  }
  
  // Si es un ticket nuevo, establecer currentOwnerId igual a userId
  if (this.isNew && !this.currentOwnerId) {
    this.currentOwnerId = this.userId;
  }
  
  // Establecer originalPrice si no existe
  if (this.isNew && !this.originalPrice) {
    this.originalPrice = this.price;
  }
  
  next();
});

// Índices para optimizar consultas
TicketSchema.index({ userId: 1, eventDate: -1 });
TicketSchema.index({ currentOwnerId: 1, eventDate: -1 });
TicketSchema.index({ forSale: 1, eventDate: 1 });
TicketSchema.index({ eventName: "text" });
TicketSchema.index({ status: 1, eventDate: 1 });

// Métodos virtuales
TicketSchema.virtual('isTransferred').get(function() {
  return this.transferCount > 0;
});

TicketSchema.virtual('daysSincePurchase').get(function() {
  return Math.floor((Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Métodos estáticos
TicketSchema.statics.findByCurrentOwner = function(ownerId) {
  return this.find({ currentOwnerId: ownerId });
};

TicketSchema.statics.findForSale = function() {
  return this.find({ forSale: true, status: 'active' });
};

// Métodos de instancia
TicketSchema.methods.transferTo = function(newOwnerId: string | mongoose.Types.ObjectId) {
  this.currentOwnerId = newOwnerId;
  this.forSale = false;
  this.transferDate = new Date();
  return this.save();
};

TicketSchema.methods.putForSale = function(salePrice?: number) {
  this.forSale = true;
  if (salePrice) this.price = salePrice;
  return this.save();
};

TicketSchema.methods.removeFromSale = function() {
  this.forSale = false;
  return this.save();
};

TicketSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.status = 'used';
  this.forSale = false;
  return this.save();
};

const Ticket = mongoose.models.Ticket
  ? mongoose.model("Ticket", TicketSchema)
  : mongoose.model("Ticket", TicketSchema);

export default Ticket;
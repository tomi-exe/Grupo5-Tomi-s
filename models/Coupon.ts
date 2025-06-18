import mongoose from "mongoose";

// Interfaces para tipado TypeScript
interface ICoupon extends mongoose.Document {
  code: string;
  eventId: mongoose.Types.ObjectId;
  eventName: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_item';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  targetAudience: 'all_attendees' | 'vip_attendees' | 'early_birds' | 'specific_users';
  applicableItems?: string[]; // IDs de productos/servicios aplicables
  
  // Métodos virtuales
  isValid: boolean;
  isExpired: boolean;
  hasUsesRemaining: boolean;
  usagePercentage: number;
  
  // Métodos de instancia
  canBeUsedBy(userId: string, eventId: string): Promise<boolean>;
  useCoupon(userId: string): Promise<ICoupon>;
  validateForEvent(eventId: string): boolean;
}

interface ICouponModel extends mongoose.Model<ICoupon> {
  findValidCouponsForEvent(eventId: string): mongoose.Query<ICoupon[], ICoupon>;
  findUserCouponsForEvent(userId: string, eventId: string): mongoose.Query<ICoupon[], ICoupon>;
  generateCouponCode(): string;
  createEventCoupon(couponData: any): Promise<ICoupon>;
}

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 20
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_item'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: null
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetAudience: {
      type: String,
      enum: ['all_attendees', 'vip_attendees', 'early_birds', 'specific_users'],
      default: 'all_attendees'
    },
    applicableItems: [{
      type: String,
      trim: true
    }]
  },
  { 
    timestamps: true,
  }
);

// Validaciones personalizadas
CouponSchema.pre('save', function(next) {
  // Validar que validUntil sea posterior a validFrom
  if (this.validUntil <= this.validFrom) {
    return next(new Error('La fecha de expiración debe ser posterior a la fecha de inicio'));
  }
  
  // Validar currentUses no exceda maxUses
  if (this.currentUses > this.maxUses) {
    return next(new Error('Los usos actuales no pueden exceder los usos máximos'));
  }
  
  // Validar discountValue para porcentajes
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    return next(new Error('El descuento porcentual no puede ser mayor al 100%'));
  }
  
  next();
});

// Índices para optimizar consultas
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ eventId: 1, isActive: 1 });
CouponSchema.index({ eventId: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ createdBy: 1, eventId: 1 });
CouponSchema.index({ validUntil: 1 }); // Para limpiezas automáticas
CouponSchema.index({ targetAudience: 1, eventId: 1 });

// Métodos virtuales
CouponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil && 
         this.currentUses < this.maxUses;
});

CouponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

CouponSchema.virtual('hasUsesRemaining').get(function() {
  return this.currentUses < this.maxUses;
});

CouponSchema.virtual('usagePercentage').get(function() {
  return Math.round((this.currentUses / this.maxUses) * 100);
});

// Métodos estáticos
CouponSchema.statics.findValidCouponsForEvent = function(eventId: string) {
  const now = new Date();
  return this.find({
    eventId: new mongoose.Types.ObjectId(eventId),
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $expr: { $lt: ['$currentUses', '$maxUses'] }
  }).sort({ validUntil: 1 });
};

CouponSchema.statics.findUserCouponsForEvent = function(userId: string, eventId: string) {
  // Esta función necesitaría una colección de CouponUsage para rastrear uso por usuario
  return this.findValidCouponsForEvent(eventId);
};

CouponSchema.statics.generateCouponCode = function(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

CouponSchema.statics.createEventCoupon = async function(couponData: any): Promise<ICoupon> {
  // Generar código único si no se proporciona
  if (!couponData.code) {
    let code: string;
    let exists = true;
    
    while (exists) {
      code = this.generateCouponCode();
      const existingCoupon = await this.findOne({ code });
      exists = !!existingCoupon;
    }
    
    couponData.code = code;
  }
  
  return await this.create(couponData);
};

// Métodos de instancia
CouponSchema.methods.canBeUsedBy = async function(userId: string, eventId: string): Promise<boolean> {
  // Verificar que el cupón pertenece al evento correcto
  if (this.eventId.toString() !== eventId) {
    return false;
  }
  
  // Verificar que el cupón está válido
  if (!this.isValid) {
    return false;
  }
  
  // Verificar que el usuario tiene un ticket para este evento
  const Ticket = mongoose.model('Ticket');
  const userTicket = await Ticket.findOne({
    $or: [
      { userId: userId },
      { currentOwnerId: userId }
    ],
    eventId: eventId,
    status: 'active'
  });
  
  if (!userTicket) {
    return false;
  }
  
  // Verificar uso previo por usuario (necesitaría CouponUsage)
  const CouponUsage = mongoose.model('CouponUsage');
  const previousUsage = await CouponUsage.findOne({
    couponId: this._id,
    userId: userId
  });
  
  if (previousUsage) {
    return false; // Ya fue usado por este usuario
  }
  
  return true;
};

CouponSchema.methods.useCoupon = async function(userId: string): Promise<ICoupon> {
  if (this.currentUses >= this.maxUses) {
    throw new Error('Este cupón ha alcanzado su límite de usos');
  }
  
  this.currentUses += 1;
  
  // Registrar el uso en CouponUsage
  const CouponUsage = mongoose.model('CouponUsage');
  await CouponUsage.create({
    couponId: this._id,
    userId: userId,
    usedAt: new Date()
  });
  
  return await this.save();
};

CouponSchema.methods.validateForEvent = function(eventId: string): boolean {
  return this.eventId.toString() === eventId;
};

const Coupon = (mongoose.models.Coupon as ICouponModel) || 
  mongoose.model<ICoupon, ICouponModel>("Coupon", CouponSchema);

export default Coupon;
export type { ICoupon, ICouponModel };
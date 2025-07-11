import mongoose from "mongoose";

// Interface para tipado TypeScript
interface ICouponUsage extends mongoose.Document {
  couponId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  discountApplied: number;
  originalAmount: number;
  finalAmount: number;
  usedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  
  // Métodos virtuales
  discountPercentage: number;
  savingsAmount: number;
}

interface ICouponUsageModel extends mongoose.Model<ICouponUsage> {
  findByUser(userId: string): mongoose.Query<ICouponUsage[], ICouponUsage>;
  findByEvent(eventId: string): mongoose.Query<ICouponUsage[], ICouponUsage>;
  findByCoupon(couponId: string): mongoose.Query<ICouponUsage[], ICouponUsage>;
  getUsageStats(couponId: string): Promise<any>;
}

const CouponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Para futura implementación de órdenes
      default: null
    },
    discountApplied: {
      type: Number,
      required: true,
      min: 0
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    usedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  { 
    timestamps: true,
  }
);

// Índices para optimizar consultas
CouponUsageSchema.index({ couponId: 1, userId: 1 }, { unique: true }); // Un usuario solo puede usar un cupón una vez
CouponUsageSchema.index({ userId: 1, eventId: 1 });
CouponUsageSchema.index({ eventId: 1, usedAt: -1 });
CouponUsageSchema.index({ usedAt: -1 });

// Métodos virtuales
CouponUsageSchema.virtual('discountPercentage').get(function() {
  if (this.originalAmount === 0) return 0;
  return Math.round((this.discountApplied / this.originalAmount) * 100);
});

CouponUsageSchema.virtual('savingsAmount').get(function() {
  return this.originalAmount - this.finalAmount;
});

// Métodos estáticos
CouponUsageSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId })
    .populate('couponId', 'code title eventName')
    .populate('eventId', 'eventName eventDate')
    .sort({ usedAt: -1 });
};

CouponUsageSchema.statics.findByEvent = function(eventId: string) {
  return this.find({ eventId })
    .populate('couponId', 'code title')
    .populate('userId', 'name email')
    .sort({ usedAt: -1 });
};

CouponUsageSchema.statics.findByCoupon = function(couponId: string) {
  return this.find({ couponId })
    .populate('userId', 'name email')
    .populate('eventId', 'eventName eventDate')
    .sort({ usedAt: -1 });
};

CouponUsageSchema.statics.getUsageStats = async function(couponId: string) {
  const stats = await this.aggregate([
    { $match: { couponId: new mongoose.Types.ObjectId(couponId) } },
    {
      $group: {
        _id: null,
        totalUses: { $sum: 1 },
        totalDiscountApplied: { $sum: '$discountApplied' },
        totalOriginalAmount: { $sum: '$originalAmount' },
        totalFinalAmount: { $sum: '$finalAmount' },
        averageDiscount: { $avg: '$discountApplied' },
        firstUse: { $min: '$usedAt' },
        lastUse: { $max: '$usedAt' }
      }
    }
  ]);
  
  const usageByDay = await this.aggregate([
    { $match: { couponId: new mongoose.Types.ObjectId(couponId) } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$usedAt' } },
        count: { $sum: 1 },
        totalDiscount: { $sum: '$discountApplied' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    summary: stats[0] || {
      totalUses: 0,
      totalDiscountApplied: 0,
      totalOriginalAmount: 0,
      totalFinalAmount: 0,
      averageDiscount: 0,
      firstUse: null,
      lastUse: null
    },
    usageByDay
  };
};

const CouponUsage = (mongoose.models.CouponUsage as ICouponUsageModel) || 
  mongoose.model<ICouponUsage, ICouponUsageModel>("CouponUsage", CouponUsageSchema);

export default CouponUsage;
export type { ICouponUsage, ICouponUsageModel };
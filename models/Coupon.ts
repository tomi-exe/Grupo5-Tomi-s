import mongoose, { Document, Model } from "mongoose";
import crypto from "crypto";

export interface ICoupon {
  code: string;
  value: number;
  description: string;
  rewardType: "drink" | "snack" | "discount" | "other";
  expiresAt: Date;
  used: boolean;
  usedBy?: mongoose.Types.ObjectId | null;
  usedAt?: Date | null;
  usedEvent?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CouponDocument extends ICoupon, Document {}
interface CouponModel extends Model<CouponDocument> {
  generateCode(): string;
}

const CouponSchema = new mongoose.Schema<CouponDocument>(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
    },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    rewardType: {
      type: String,
      enum: ["drink", "snack", "discount", "other"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    usedAt: { type: Date, default: null },
    usedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  },
  {
    timestamps: true,
  }
);

// Índices
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CouponSchema.index({ usedBy: 1 });

// Método estático para código
CouponSchema.static("generateCode", function () {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
});

// Hook para asignar code antes de validar
CouponSchema.pre("validate", function (this: CouponDocument, next) {
  if (this.isNew && !this.code) {
    this.code = (this.constructor as CouponModel).generateCode();
  }
  next();
});

const Coupon = mongoose.models.Coupon
  ? (mongoose.model<CouponDocument, CouponModel>("Coupon") as CouponModel)
  : mongoose.model<CouponDocument, CouponModel>("Coupon", CouponSchema);

export default Coupon;

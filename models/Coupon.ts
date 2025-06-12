import mongoose, { Document, Model } from "mongoose";
import crypto from "crypto";

export interface ICoupon {
  code: string;
  value: number;
  description: string;
  rewardType: "drink" | "snack" | "discount" | "other";
  expiresAt: Date;
  used: boolean;
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
  },
  {
    timestamps: true,
  }
);

// Índices
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

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

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Percent,
  Gift,
  Loader2,
  Users
} from 'lucide-react';
import { useToast } from '../Components/Toast';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_item';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validUntil: string;
  usagePercentage: number;
}

interface CouponValidation {
  valid: boolean;
  reason?: string;
  coupon?: {
    code: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
}

interface Props {
  eventId: string;
  eventName: string;
  purchaseAmount?: number;
  onCouponApplied?: (discountAmount: number, finalAmount: number) => void;
}

export default function CouponValidation({ 
  eventId, 
  eventName, 
  purchaseAmount = 0, 
  onCouponApplied 
}: Props) {
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [validation, setValidation] = useState<CouponValidation | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    if (eventId) {
      fetchAvailableCoupons();
    }
  }, [eventId]);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch(`/api/coupons/user?eventId=${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching available coupons:', error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setValidation(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          eventId,
          purchaseAmount
        })
      });

      const data = await response.json();
      setValidation(data);

      if (!data.valid) {
        addToast(data.reason || 'Cupón inválido', 'error');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      addToast('Error al validar cupón', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!validation?.valid || !validation.coupon) return;

    setApplying(true);
    try {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          eventId,
          originalAmount: purchaseAmount
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon({
          code: validation.coupon.code,
          title: validation.coupon.title,
          discountApplied: data.discountApplied,
          finalAmount: data.finalAmount,
          savings: data.savings
        });
        
        addToast(`Cupón "${validation.coupon.code}" aplicado exitosamente`, 'success');
        
        if (onCouponApplied) {
          onCouponApplied(data.discountApplied, data.finalAmount);
        }
        
        // Limpiar validación
        setValidation(null);
        setCouponCode('');
      } else {
        addToast(data.message || 'Error al aplicar cupón', 'error');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      addToast('Error al aplicar cupón', 'error');
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    if (onCouponApplied) {
      onCouponApplied(0, purchaseAmount);
    }
    addToast('Cupón removido', 'info');
  };

  const formatDiscountValue = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}%`;
      case 'fixed_amount':
        return `$${coupon.discountValue.toLocaleString()}`;
      case 'free_item':
        return 'Gratis';
      default:
        return coupon.discountValue.toString();
    }
  };

  const getDiscountIcon = (discountType: string) => {
    switch (discountType) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed_amount':
        return <DollarSign className="w-4 h-4" />;
      case 'free_item':
        return <Gift className="w-4 h-4" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  // Si ya hay un cupón aplicado, mostrar resumen
  if (appliedCoupon) {
    return (
      <div className="bg-[#192734] rounded-lg p-6 border border-green-500/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-400">Cupón Aplicado</h3>
              <p className="text-sm text-gray-300">{appliedCoupon.title}</p>
              <p className="text-xs text-gray-400">Código: {appliedCoupon.code}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-green-400">
              -${appliedCoupon.discountApplied.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              Total: ${appliedCoupon.finalAmount.toLocaleString()}
            </div>
            <button
              onClick={removeCoupon}
              className="text-xs text-red-400 hover:text-red-300 mt-1"
            >
              Remover cupón
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulario de validación de cupón */}
      <div className="bg-[#192734] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-purple-500" />
          Aplicar Cupón de Descuento
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Código de Cupón para {eventName}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setValidation(null);
                }}
                onBlur={validateCoupon}
                placeholder="Ingresa tu código de cupón"
                className="flex-1 bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white placeholder-gray-400"
                maxLength={20}
              />
              <button
                onClick={validateCoupon}
                disabled={!couponCode.trim() || loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validar'}
              </button>
            </div>
          </div>
          
          {/* Resultado de validación */}
          {validation && (
            <div className={`p-4 rounded-lg border ${
              validation.valid 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              {validation.valid && validation.coupon ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Cupón Válido</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">{validation.coupon.title}</p>
                      <p className="text-gray-300">{validation.coupon.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getDiscountIcon(validation.coupon.discountType)}
                        <span className="font-bold text-green-400">
                          Descuento: ${validation.coupon.discountAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Nuevo total: ${(purchaseAmount - validation.coupon.discountAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={applyCoupon}
                    disabled={applying}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded transition flex items-center justify-center gap-2"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      'Aplicar Cupón'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{validation.reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cupones disponibles */}
      {availableCoupons.length > 0 && (
        <div className="bg-[#192734] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-500" />
              Cupones Disponibles
            </h3>
            <button
              onClick={() => setShowAvailable(!showAvailable)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showAvailable ? 'Ocultar' : 'Ver disponibles'}
            </button>
          </div>
          
          {showAvailable && (
            <div className="space-y-3">
              {availableCoupons.map((coupon) => (
                <div 
                  key={coupon.id}
                  className="border border-[#233748] rounded-lg p-4 hover:border-purple-500/50 transition cursor-pointer"
                  onClick={() => setCouponCode(coupon.code)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{coupon.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{coupon.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {getDiscountIcon(coupon.discountType)}
                          <span>{formatDiscountValue(coupon)}</span>
                        </div>
                        {coupon.minPurchaseAmount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Min: ${coupon.minPurchaseAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Exp: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm bg-[#0d1117] px-2 py-1 rounded border">
                        {coupon.code}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {coupon.usagePercentage}% usado
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
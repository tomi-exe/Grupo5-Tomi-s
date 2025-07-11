"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Ticket, 
  Calendar, 
  Users, 
  Percent, 
  DollarSign,
  Clock,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  TrendingUp
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
  validFrom: string;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  usagePercentage: number;
  isActive: boolean;
  targetAudience: string;
  eventName: string;
}

interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  maxCapacity: number;
  currentCheckedIn: number;
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    eventId: '',
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount' | 'free_item',
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    maxUses: 1,
    targetAudience: 'all_attendees' as 'all_attendees' | 'vip_attendees' | 'early_birds',
    customCode: ''
  });

  const addToast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchCoupons(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      // En un caso real, tendrías un endpoint para obtener eventos del organizador
      // Por ahora simulamos con eventos estáticos
      const mockEvents: Event[] = [
        {
          _id: '1',
          eventName: 'Concierto Coldplay',
          eventDate: '2025-07-01T20:00:00.000Z',
          maxCapacity: 1500,
          currentCheckedIn: 850
        },
        {
          _id: '2',
          eventName: 'Festival de Jazz',
          eventDate: '2025-08-15T18:00:00.000Z',
          maxCapacity: 2000,
          currentCheckedIn: 1200
        },
        {
          _id: '3',
          eventName: 'Stand-Up Comedy Show',
          eventDate: '2025-09-05T21:00:00.000Z',
          maxCapacity: 800,
          currentCheckedIn: 450
        }
      ];
      
      setEvents(mockEvents);
      if (mockEvents.length > 0) {
        setSelectedEvent(mockEvents[0]._id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      addToast('Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async (eventId: string) => {
    try {
      const response = await fetch(`/api/coupons?eventId=${eventId}&includeExpired=true`);
      const data = await response.json();
      
      if (response.ok) {
        setCoupons(data.coupons || []);
      } else {
        addToast('Error al cargar cupones', 'error');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      addToast('Error al cargar cupones', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          eventId: selectedEvent,
          minPurchaseAmount: formData.minPurchaseAmount || undefined,
          maxDiscountAmount: formData.maxDiscountAmount || undefined,
          customCode: formData.customCode || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Cupón creado exitosamente', 'success');
        setShowCreateForm(false);
        resetForm();
        fetchCoupons(selectedEvent);
      } else {
        addToast(data.message || 'Error al crear cupón', 'error');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      addToast('Error al crear cupón', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      eventId: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: 0,
      validFrom: '',
      validUntil: '',
      maxUses: 1,
      targetAudience: 'all_attendees',
      customCode: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Código copiado al portapapeles', 'success');
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

  const getStatusColor = (coupon: Coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    
    if (!coupon.isActive) return 'text-gray-400 bg-gray-500/20';
    if (validUntil < now) return 'text-red-400 bg-red-500/20';
    if (coupon.currentUses >= coupon.maxUses) return 'text-orange-400 bg-orange-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getStatusText = (coupon: Coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    
    if (!coupon.isActive) return 'Inactivo';
    if (validUntil < now) return 'Expirado';
    if (coupon.currentUses >= coupon.maxUses) return 'Agotado';
    return 'Activo';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111a22] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando gestión de cupones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-500" />
              Gestión de Cupones
            </h1>
            <p className="text-gray-400 mt-2">
              Crea y gestiona cupones de descuento para tus eventos
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Crear Cupón
          </button>
        </div>

        {/* Selector de Evento */}
        <div className="bg-[#192734] rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Seleccionar Evento</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
          >
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Estadísticas Rápidas */}
        {selectedEvent && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-400">Total Cupones</span>
              </div>
              <p className="text-2xl font-bold">{coupons.length}</p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">Activos</span>
              </div>
              <p className="text-2xl font-bold">
                {coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date()).length}
              </p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-400">Usos Totales</span>
              </div>
              <p className="text-2xl font-bold">
                {coupons.reduce((sum, c) => sum + c.currentUses, 0)}
              </p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-400">Por Expirar</span>
              </div>
              <p className="text-2xl font-bold">
                {coupons.filter(c => {
                  const daysUntilExpiry = (new Date(c.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                }).length}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Cupones */}
        <div className="bg-[#192734] rounded-lg">
          <div className="p-6 border-b border-[#233748]">
            <h2 className="text-xl font-bold">Cupones del Evento</h2>
          </div>
          
          <div className="divide-y divide-[#233748]">
            {coupons.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay cupones para este evento</p>
                <p className="text-sm">Crea tu primer cupón para comenzar</p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="p-6 hover:bg-[#233748] transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{coupon.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon)}`}>
                          {getStatusText(coupon)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{coupon.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Descuento: {formatDiscountValue(coupon)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Usos: {coupon.currentUses}/{coupon.maxUses}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Expira: {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold font-mono bg-[#0d1117] px-3 py-1 rounded border">
                          {coupon.code}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {coupon.usagePercentage}% usado
                        </div>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="p-2 hover:bg-[#2c3e50] rounded-lg transition"
                        title="Copiar código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-2 hover:bg-[#2c3e50] rounded-lg transition"
                        title="Ver estadísticas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Barra de progreso de uso */}
                  <div className="w-full bg-[#233748] rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(coupon.usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de Creación */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#192734] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#233748]">
                <h2 className="text-xl font-bold">Crear Nuevo Cupón</h2>
              </div>
              
              <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Código Personalizado (Opcional)</label>
                    <input
                      type="text"
                      value={formData.customCode}
                      onChange={(e) => setFormData({...formData, customCode: e.target.value.toUpperCase()})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      placeholder="Ej: DESCUENTO2025"
                      maxLength={20}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Descuento</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    >
                      <option value="percentage">Porcentaje</option>
                      <option value="fixed_amount">Monto Fijo</option>
                      <option value="free_item">Item Gratis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor del Descuento {formData.discountType === 'percentage' && '(%)'}
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      min="0"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Inicio</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Expiración</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Máximo de Usos</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Compra Mínima ($)</label>
                    <input
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData({...formData, minPurchaseAmount: Number(e.target.value)})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Descuento Máximo ($)</label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Audiencia Objetivo</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                  >
                    <option value="all_attendees">Todos los Asistentes</option>
                    <option value="vip_attendees">Asistentes VIP</option>
                    <option value="early_birds">Compradores Tempranos</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Crear Cupón
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
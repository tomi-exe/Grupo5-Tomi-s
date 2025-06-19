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
  TrendingUp,
  Settings,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Interfaces
interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  maxCapacity: number;
  currentCheckedIn: number;
  location: string;
  basePrice: number;
  status: string;
}

interface Coupon {
  _id: string;
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
  eventId: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface CouponFormData {
  eventId: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_item';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  targetAudience: 'all_attendees' | 'vip_attendees' | 'early_birds';
  customCode: string;
}

export default function AdminCouponManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'exhausted'>('all');
  const [formData, setFormData] = useState<CouponFormData>({
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

  // Datos simulados para demostración
  const mockEvents: Event[] = [
    {
      _id: '1',
      eventName: 'Concierto Coldplay',
      eventDate: '2025-07-01T20:00:00.000Z',
      maxCapacity: 1500,
      currentCheckedIn: 850,
      location: 'Estadio Nacional',
      basePrice: 80000,
      status: 'upcoming'
    },
    {
      _id: '2',
      eventName: 'Festival de Jazz',
      eventDate: '2025-08-15T18:00:00.000Z',
      maxCapacity: 2000,
      currentCheckedIn: 1200,
      location: 'Centro de Eventos',
      basePrice: 45000,
      status: 'upcoming'
    },
    {
      _id: '3',
      eventName: 'Stand-Up Comedy Show',
      eventDate: '2025-09-05T21:00:00.000Z',
      maxCapacity: 800,
      currentCheckedIn: 450,
      location: 'Teatro Municipal',
      basePrice: 25000,
      status: 'upcoming'
    }
  ];

  const mockCoupons: Coupon[] = [
    {
      _id: '1',
      code: 'EARLYBIRD2025',
      title: 'Descuento Early Bird',
      description: 'Descuento especial para compradores tempranos',
      discountType: 'percentage',
      discountValue: 15,
      minPurchaseAmount: 50000,
      maxDiscountAmount: 20000,
      validFrom: '2025-06-01T00:00:00.000Z',
      validUntil: '2025-06-30T23:59:59.000Z',
      maxUses: 100,
      currentUses: 45,
      usagePercentage: 45,
      isActive: true,
      targetAudience: 'early_birds',
      eventName: 'Concierto Coldplay',
      eventId: '1',
      createdBy: {
        name: 'Admin User',
        email: 'admin@ticketzone.cl'
      },
      createdAt: '2025-05-15T10:00:00.000Z'
    },
    {
      _id: '2',
      code: 'JAZZVIP30',
      title: 'Descuento VIP Jazz',
      description: 'Descuento exclusivo para entradas VIP',
      discountType: 'fixed_amount',
      discountValue: 15000,
      minPurchaseAmount: 40000,
      validFrom: '2025-07-01T00:00:00.000Z',
      validUntil: '2025-08-14T23:59:59.000Z',
      maxUses: 50,
      currentUses: 12,
      usagePercentage: 24,
      isActive: true,
      targetAudience: 'vip_attendees',
      eventName: 'Festival de Jazz',
      eventId: '2',
      createdBy: {
        name: 'Admin User',
        email: 'admin@ticketzone.cl'
      },
      createdAt: '2025-06-01T14:30:00.000Z'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setEvents(mockEvents);
      setCoupons(mockCoupons);
      if (mockEvents.length > 0) {
        setSelectedEvent(mockEvents[0]._id);
      }
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.title || !formData.description || !selectedEvent) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      alert('El descuento porcentual no puede ser mayor al 100%');
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      // Simular creación de cupón
      const newCoupon: Coupon = {
        _id: (Math.random() * 1000).toString(),
        code: formData.customCode || generateCouponCode(),
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minPurchaseAmount: formData.minPurchaseAmount || undefined,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        maxUses: formData.maxUses,
        currentUses: 0,
        usagePercentage: 0,
        isActive: true,
        targetAudience: formData.targetAudience,
        eventName: events.find(e => e._id === selectedEvent)?.eventName || '',
        eventId: selectedEvent,
        createdBy: {
          name: 'Admin User',
          email: 'admin@ticketzone.cl'
        },
        createdAt: new Date().toISOString()
      };

      setCoupons(prev => [newCoupon, ...prev]);
      setShowCreateForm(false);
      resetForm();
      alert('Cupón creado exitosamente');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Error al crear cupón');
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      eventId: coupon.eventId,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      validFrom: coupon.validFrom.split('T')[0] + 'T' + coupon.validFrom.split('T')[1].slice(0, 5),
      validUntil: coupon.validUntil.split('T')[0] + 'T' + coupon.validUntil.split('T')[1].slice(0, 5),
      maxUses: coupon.maxUses,
      targetAudience: coupon.targetAudience as any,
      customCode: coupon.code
    });
    setShowEditForm(true);
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCoupon) return;

    try {
      const updatedCoupons = coupons.map(coupon => {
        if (coupon._id === editingCoupon._id) {
          return {
            ...coupon,
            title: formData.title,
            description: formData.description,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minPurchaseAmount: formData.minPurchaseAmount || undefined,
            maxDiscountAmount: formData.maxDiscountAmount || undefined,
            validFrom: formData.validFrom,
            validUntil: formData.validUntil,
            maxUses: formData.maxUses,
            targetAudience: formData.targetAudience,
            code: formData.customCode || coupon.code
          };
        }
        return coupon;
      });

      setCoupons(updatedCoupons);
      setShowEditForm(false);
      setEditingCoupon(null);
      resetForm();
      alert('Cupón actualizado exitosamente');
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Error al actualizar cupón');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) return;

    try {
      setCoupons(prev => prev.filter(c => c._id !== couponId));
      alert('Cupón eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error al eliminar cupón');
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    try {
      setCoupons(prev => prev.map(coupon => {
        if (coupon._id === couponId) {
          return { ...coupon, isActive: !coupon.isActive };
        }
        return coupon;
      }));
      alert('Estado del cupón actualizado');
    } catch (error) {
      console.error('Error updating coupon status:', error);
      alert('Error al actualizar estado del cupón');
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

  const generateCouponCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado al portapapeles');
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

  const filteredCoupons = coupons.filter(coupon => {
    // Filtro por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.eventName.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    let matchesStatus = true;

    switch (filterStatus) {
      case 'active':
        matchesStatus = coupon.isActive && validUntil >= now && coupon.currentUses < coupon.maxUses;
        break;
      case 'expired':
        matchesStatus = validUntil < now;
        break;
      case 'exhausted':
        matchesStatus = coupon.currentUses >= coupon.maxUses;
        break;
      case 'all':
      default:
        matchesStatus = true;
    }

    // Filtro por evento seleccionado
    const matchesEvent = !selectedEvent || coupon.eventId === selectedEvent;

    return matchesSearch && matchesStatus && matchesEvent;
  });

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
              <Settings className="w-8 h-8 text-purple-500" />
              Administración de Cupones
            </h1>
            <p className="text-gray-400 mt-2">
              Panel administrativo para crear y gestionar cupones de descuento
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => alert('Función de exportación en desarrollo')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Crear Cupón
            </button>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
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

        {/* Filtros y Búsqueda */}
        <div className="bg-[#192734] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, código o evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#233748] rounded px-10 py-2 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Evento</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              >
                <option value="">Todos los eventos</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="expired">Expirados</option>
                <option value="exhausted">Agotados</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedEvent('');
                  setFilterStatus('all');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Filter className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Cupones */}
        <div className="bg-[#192734] rounded-lg">
          <div className="p-6 border-b border-[#233748]">
            <h2 className="text-xl font-bold">
              Cupones ({filteredCoupons.length} {filteredCoupons.length === 1 ? 'resultado' : 'resultados'})
            </h2>
          </div>
          
          <div className="divide-y divide-[#233748]">
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No se encontraron cupones</p>
                <p className="text-sm">Ajusta los filtros o crea un nuevo cupón</p>
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div key={coupon._id} className="p-6 hover:bg-[#233748] transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{coupon.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon)}`}>
                          {getStatusText(coupon)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{coupon.description}</p>
                      <p className="text-purple-400 text-sm mb-2">Evento: {coupon.eventName}</p>
                      
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
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-2 hover:bg-[#2c3e50] rounded-lg transition"
                        title="Editar cupón"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleCouponStatus(coupon._id)}
                        className="p-2 hover:bg-[#2c3e50] rounded-lg transition"
                        title={coupon.isActive ? "Desactivar" : "Activar"}
                      >
                        <Eye className={`w-4 h-4 ${coupon.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-2 hover:bg-red-600/20 rounded-lg transition"
                        title="Eliminar cupón"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
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
                    <label className="block text-sm font-medium mb-2">Evento *</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => {
                        setSelectedEvent(e.target.value);
                        setFormData({...formData, eventId: e.target.value});
                      }}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    >
                      <option value="">Seleccionar evento</option>
                      {events.map(event => (
                        <option key={event._id} value={event._id}>
                          {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Código Personalizado</label>
                    <input
                      type="text"
                      value={formData.customCode}
                      onChange={(e) => setFormData({...formData, customCode: e.target.value.toUpperCase()})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      placeholder="Dejar vacío para generar automáticamente"
                      maxLength={20}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    required
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    rows={3}
                    required
                    maxLength={500}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Descuento *</label>
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
                      Valor del Descuento * {formData.discountType === 'percentage' && '(%)'}
                      {formData.discountType === 'fixed_amount' && '($)'}
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
                    <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Expiración *</label>
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
                    <label className="block text-sm font-medium mb-2">Máximo de Usos *</label>
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

        {/* Modal de Edición */}
        {showEditForm && editingCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#192734] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#233748]">
                <h2 className="text-xl font-bold">Editar Cupón: {editingCoupon.code}</h2>
              </div>
              
              <form onSubmit={handleUpdateCoupon} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Evento</label>
                    <input
                      type="text"
                      value={editingCoupon.eventName}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-gray-400"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Código del Cupón</label>
                    <input
                      type="text"
                      value={formData.customCode}
                      onChange={(e) => setFormData({...formData, customCode: e.target.value.toUpperCase()})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      maxLength={20}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    required
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                    rows={3}
                    required
                    maxLength={500}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Descuento *</label>
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
                      Valor del Descuento * {formData.discountType === 'percentage' && '(%)'}
                      {formData.discountType === 'fixed_amount' && '($)'}
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
                    <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Expiración *</label>
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
                    <label className="block text-sm font-medium mb-2">Máximo de Usos *</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                      className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2"
                      min={editingCoupon.currentUses}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Mínimo: {editingCoupon.currentUses} (usos actuales)
                    </p>
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
                
                {/* Información de uso */}
                <div className="bg-[#233748] p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Estadísticas de Uso</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Usos actuales:</span>
                      <span className="ml-2 font-medium">{editingCoupon.currentUses}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Porcentaje usado:</span>
                      <span className="ml-2 font-medium">{editingCoupon.usagePercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Creado:</span>
                      <span className="ml-2 font-medium">
                        {new Date(editingCoupon.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Creado por:</span>
                      <span className="ml-2 font-medium">{editingCoupon.createdBy.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCoupon(null);
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
                    Actualizar Cupón
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
import mongoose from "mongoose";

// Interface para tipado TypeScript
interface IEvent extends mongoose.Document {
  eventName: string;
  eventDate: Date;
  location: string;
  description?: string;
  maxCapacity: number;
  currentCheckedIn: number;
  availableCapacity: number;
  basePrice: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos virtuales
  isFull: boolean;
  occupancyPercentage: number;
  
  // Métodos de instancia
  checkIn(): Promise<IEvent>;
  isCheckInAllowed(): boolean;
  getRemainingCapacity(): number;
}

interface IEventModel extends mongoose.Model<IEvent> {
  findByEventName(eventName: string): mongoose.Query<IEvent | null, IEvent>;
  findUpcomingEvents(): mongoose.Query<IEvent[], IEvent>;
  getEventCapacityStats(eventId: string): Promise<any>;
}

const EventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: [1, 'La capacidad máxima debe ser mayor a 0'],
    },
    currentCheckedIn: {
      type: Number,
      default: 0,
      min: [0, 'Los check-ins no pueden ser negativos'],
    },
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'El precio base no puede ser negativo'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { 
    timestamps: true,
  }
);

// Middleware para validar que currentCheckedIn no exceda maxCapacity
EventSchema.pre('save', function(next) {
  if (this.currentCheckedIn > this.maxCapacity) {
    return next(new Error(`Los check-ins (${this.currentCheckedIn}) no pueden exceder la capacidad máxima (${this.maxCapacity})`));
  }
  next();
});

// Índices para optimizar consultas
EventSchema.index({ eventName: 1 });
EventSchema.index({ eventDate: 1 });
EventSchema.index({ status: 1, eventDate: 1 });
EventSchema.index({ eventName: "text", location: "text", description: "text" });

// Métodos virtuales
EventSchema.virtual('isFull').get(function() {
  return this.currentCheckedIn >= this.maxCapacity;
});

EventSchema.virtual('occupancyPercentage').get(function() {
  return Math.round((this.currentCheckedIn / this.maxCapacity) * 100);
});

EventSchema.virtual('availableCapacity').get(function() {
  return Math.max(0, this.maxCapacity - this.currentCheckedIn);
});

// Métodos estáticos
EventSchema.statics.findByEventName = function(eventName: string) {
  return this.findOne({ eventName: new RegExp(eventName, 'i') });
};

EventSchema.statics.findUpcomingEvents = function() {
  return this.find({ 
    status: 'upcoming',
    eventDate: { $gte: new Date() }
  }).sort({ eventDate: 1 });
};

EventSchema.statics.getEventCapacityStats = async function(eventId: string) {
  const event = await this.findById(eventId);
  if (!event) return null;
  
  return {
    eventName: event.eventName,
    maxCapacity: event.maxCapacity,
    currentCheckedIn: event.currentCheckedIn,
    availableCapacity: event.availableCapacity,
    occupancyPercentage: event.occupancyPercentage,
    isFull: event.isFull,
    status: event.status
  };
};

// Métodos de instancia
EventSchema.methods.checkIn = async function() {
  if (this.isFull) {
    throw new Error('El evento ha alcanzado su capacidad máxima');
  }
  
  this.currentCheckedIn += 1;
  return await this.save();
};

EventSchema.methods.isCheckInAllowed = function() {
  return !this.isFull && this.status === 'upcoming';
};

EventSchema.methods.getRemainingCapacity = function() {
  return this.availableCapacity;
};

const Event = (mongoose.models.Event as IEventModel) || 
  mongoose.model<IEvent, IEventModel>("Event", EventSchema);

export default Event;
export type { IEvent, IEventModel };
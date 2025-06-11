import mongoose from "mongoose";

// Interface para tipado TypeScript
interface ICheckIn extends mongoose.Document {
  ticketId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  checkInTime: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  verificationMethod: 'qr_scan' | 'manual' | 'nfc';
  status: 'successful' | 'failed' | 'duplicate';
  notes?: string;
  verifiedBy?: mongoose.Types.ObjectId; // ID del staff que verificó (si aplica)
}

interface ICheckInModel extends mongoose.Model<ICheckIn> {
  findByTicket(ticketId: string): mongoose.Query<ICheckIn | null, ICheckIn>;
  findByEvent(eventId: string): mongoose.Query<ICheckIn[], ICheckIn>;
  getEventCheckInStats(eventId: string): Promise<any>;
  isTicketAlreadyCheckedIn(ticketId: string): Promise<boolean>;
}

const CheckInSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    verificationMethod: {
      type: String,
      enum: ['qr_scan', 'manual', 'nfc'],
      default: 'qr_scan',
      required: true,
    },
    status: {
      type: String,
      enum: ['successful', 'failed', 'duplicate'],
      default: 'successful',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { 
    timestamps: true,
  }
);

// Índices para optimizar consultas
CheckInSchema.index({ ticketId: 1 }, { unique: true }); // Un ticket solo puede hacer check-in una vez
CheckInSchema.index({ eventId: 1, checkInTime: -1 });
CheckInSchema.index({ userId: 1, checkInTime: -1 });
CheckInSchema.index({ checkInTime: -1 });
CheckInSchema.index({ status: 1, eventId: 1 });

// Métodos estáticos
CheckInSchema.statics.findByTicket = function(ticketId: string) {
  return this.findOne({ ticketId });
};

CheckInSchema.statics.findByEvent = function(eventId: string) {
  return this.find({ eventId, status: 'successful' })
    .populate('ticketId', 'eventName price')
    .populate('userId', 'name email')
    .sort({ checkInTime: -1 });
};

CheckInSchema.statics.getEventCheckInStats = async function(eventId: string) {
  const stats = await this.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        latestCheckIn: { $max: '$checkInTime' }
      }
    }
  ]);
  
  const totalCheckIns = await this.countDocuments({ 
    eventId: new mongoose.Types.ObjectId(eventId), 
    status: 'successful' 
  });
  
  const checkInsPerHour = await this.aggregate([
    { 
      $match: { 
        eventId: new mongoose.Types.ObjectId(eventId),
        status: 'successful',
        checkInTime: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
        }
      }
    },
    {
      $group: {
        _id: { 
          hour: { $hour: '$checkInTime' },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' } }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': -1, '_id.hour': -1 } }
  ]);
  
  return {
    statusBreakdown: stats,
    totalSuccessfulCheckIns: totalCheckIns,
    checkInsPerHour: checkInsPerHour.slice(0, 24) // últimas 24 horas
  };
};

CheckInSchema.statics.isTicketAlreadyCheckedIn = async function(ticketId: string) {
  const existingCheckIn = await this.findOne({ 
    ticketId: new mongoose.Types.ObjectId(ticketId),
    status: 'successful'
  });
  return !!existingCheckIn;
};

const CheckIn = (mongoose.models.CheckIn as ICheckInModel) || 
  mongoose.model<ICheckIn, ICheckInModel>("CheckIn", CheckInSchema);

export default CheckIn;
export type { ICheckIn, ICheckInModel };
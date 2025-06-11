// Script de migración para integrar aforo con sistema de check-in
// Ejecutar con: node scripts/migrate-checkin-capacity.js

const mongoose = require('mongoose');

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prograpro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Esquemas temporales para la migración
const TicketSchema = new mongoose.Schema({
  eventName: String,
  eventDate: Date,
  price: Number,
  disp: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  currentOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  forSale: { type: Boolean, default: false },
  transferDate: Date,
  isUsed: { type: Boolean, default: false },
  sold: { type: Boolean, default: false },
  purchaseDate: { type: Date, default: Date.now },
  lastTransferDate: Date,
  transferCount: { type: Number, default: 0 },
  originalPrice: Number,
  status: { type: String, default: "active" },
  checkInDate: Date
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true, unique: true },
  eventDate: { type: Date, required: true },
  location: { type: String, required: true },
  description: String,
  maxCapacity: { type: Number, required: true },
  currentCheckedIn: { type: Number, default: 0 },
  basePrice: { type: Number, required: true },
  status: { type: String, default: 'upcoming' }
}, { timestamps: true });

const CheckInSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkInTime: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  verificationMethod: { type: String, default: 'qr_scan' },
  status: { type: String, default: 'successful' },
  notes: String,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);
const Event = mongoose.model('Event', EventSchema);
const CheckIn = mongoose.model('CheckIn', CheckInSchema);

async function createEventsFromTickets() {
  try {
    console.log('🎪 Creando eventos basados en tickets existentes...');
    
    // Agrupar tickets por evento
    const eventGroups = await Ticket.aggregate([
      {
        $group: {
          _id: '$eventName',
          eventDate: { $first: '$eventDate' },
          totalTickets: { $sum: 1 },
          usedTickets: { 
            $sum: { $cond: [{ $eq: ['$isUsed', true] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          maxDisp: { $max: '$disp' }
        }
      }
    ]);
    
    console.log(`📋 Encontrados ${eventGroups.length} eventos únicos`);
    
    let createdEvents = 0;
    let skippedEvents = 0;
    
    for (const eventGroup of eventGroups) {
      try {
        // Verificar si el evento ya existe
        const existingEvent = await Event.findOne({ 
          eventName: eventGroup._id 
        });
        
        if (existingEvent) {
          console.log(`⏭️  Evento "${eventGroup._id}" ya existe, actualizando...`);
          
          // Actualizar el evento existente con información actualizada
          existingEvent.currentCheckedIn = eventGroup.usedTickets;
          existingEvent.maxCapacity = Math.max(
            existingEvent.maxCapacity,
            eventGroup.totalTickets + 100 // Agregar buffer
          );
          await existingEvent.save();
          skippedEvents++;
          continue;
        }
        
        // Determinar capacidad máxima (usar el mayor entre tickets vendidos + buffer)
        const maxCapacity = Math.max(
          eventGroup.maxDisp || 1000,
          eventGroup.totalTickets + 200 // Buffer para ventas adicionales
        );
        
        // Determinar estado del evento
        const eventDate = new Date(eventGroup.eventDate);
        const now = new Date();
        let status = 'upcoming';
        
        if (eventDate < now) {
          const timeDiff = now.getTime() - eventDate.getTime();
          const hoursPassed = timeDiff / (1000 * 60 * 60);
          
          if (hoursPassed > 6) {
            status = 'completed';
          } else {
            status = 'ongoing';
          }
        }
        
        // Crear nuevo evento
        const newEvent = new Event({
          eventName: eventGroup._id,
          eventDate: eventGroup.eventDate,
          location: "Ubicación por determinar", // Se puede actualizar manualmente
          description: `Evento generado automáticamente para ${eventGroup._id}`,
          maxCapacity: maxCapacity,
          currentCheckedIn: eventGroup.usedTickets,
          basePrice: Math.round(eventGroup.averagePrice),
          status: status
        });
        
        await newEvent.save();
        
        // Actualizar tickets con el eventId
        await Ticket.updateMany(
          { eventName: eventGroup._id },
          { $set: { eventId: newEvent._id } }
        );
        
        createdEvents++;
        console.log(`✅ Evento "${eventGroup._id}" creado (Capacidad: ${maxCapacity}, Check-ins: ${eventGroup.usedTickets})`);
        
      } catch (error) {
        console.error(`❌ Error procesando evento "${eventGroup._id}":`, error.message);
      }
    }
    
    console.log('📊 Resumen de creación de eventos:');
    console.log(`   🆕 Eventos creados: ${createdEvents}`);
    console.log(`   🔄 Eventos actualizados: ${skippedEvents}`);
    console.log(`   📋 Total procesados: ${createdEvents + skippedEvents}`);
    
  } catch (error) {
    console.error('❌ Error creando eventos:', error);
  }
}

async function migrateUsedTicketsToCheckIns() {
  try {
    console.log('🔄 Migrando tickets usados a registros de check-in...');
    
    // Encontrar tickets usados que no tienen check-in registrado
    const usedTickets = await Ticket.find({ 
      isUsed: true,
      status: 'used'
    }).populate('eventId userId');
    
    console.log(`📋 Encontrados ${usedTickets.length} tickets usados para migrar`);
    
    let migratedCheckIns = 0;
    let skippedCheckIns = 0;
    
    for (const ticket of usedTickets) {
      try {
        // Verificar si ya existe un check-in para este ticket
        const existingCheckIn = await CheckIn.findOne({ 
          ticketId: ticket._id 
        });
        
        if (existingCheckIn) {
          skippedCheckIns++;
          continue;
        }
        
        // Determinar fecha de check-in
        let checkInTime = ticket.checkInDate || ticket.updatedAt || ticket.createdAt;
        
        // Si no hay eventId, intentar encontrarlo
        let eventId = ticket.eventId;
        if (!eventId) {
          const event = await Event.findOne({ eventName: ticket.eventName });
          if (event) {
            eventId = event._id;
            // Actualizar el ticket con el eventId
            await Ticket.findByIdAndUpdate(ticket._id, { eventId: event._id });
          }
        }
        
        if (!eventId) {
          console.log(`⚠️  No se pudo encontrar evento para ticket ${ticket._id}`);
          continue;
        }
        
        // Crear registro de check-in
        const checkIn = new CheckIn({
          ticketId: ticket._id,
          eventId: eventId,
          userId: ticket.userId || ticket.currentOwnerId,
          checkInTime: checkInTime,
          verificationMethod: 'manual', // Marcado como migración manual
          status: 'successful',
          notes: 'Migrado automáticamente desde ticket usado'
        });
        
        await checkIn.save();
        
        // Actualizar fecha de check-in del ticket si no existe
        if (!ticket.checkInDate) {
          await Ticket.findByIdAndUpdate(ticket._id, { 
            checkInDate: checkInTime 
          });
        }
        
        migratedCheckIns++;
        
        if (migratedCheckIns % 10 === 0) {
          console.log(`⏳ Migrados ${migratedCheckIns}/${usedTickets.length} check-ins...`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrando check-in para ticket ${ticket._id}:`, error.message);
      }
    }
    
    console.log('📊 Resumen de migración de check-ins:');
    console.log(`   🆕 Check-ins creados: ${migratedCheckIns}`);
    console.log(`   ⏭️  Check-ins omitidos: ${skippedCheckIns}`);
    console.log(`   📋 Total procesados: ${migratedCheckIns + skippedCheckIns}`);
    
  } catch (error) {
    console.error('❌ Error migrando check-ins:', error);
  }
}

async function updateEventCapacities() {
  try {
    console.log('📊 Actualizando capacidades de eventos basadas en check-ins...');
    
    const events = await Event.find({});
    
    for (const event of events) {
      // Contar check-ins exitosos para este evento
      const successfulCheckIns = await CheckIn.countDocuments({
        eventId: event._id,
        status: 'successful'
      });
      
      // Actualizar la cuenta actual de check-ins
      if (event.currentCheckedIn !== successfulCheckIns) {
        console.log(`🔄 Actualizando "${event.eventName}": ${event.currentCheckedIn} → ${successfulCheckIns}`);
        event.currentCheckedIn = successfulCheckIns;
        await event.save();
      }
    }
    
    console.log('✅ Capacidades de eventos actualizadas');
    
  } catch (error) {
    console.error('❌ Error actualizando capacidades:', error);
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creando índices optimizados...');
    
    // Índices para Event
    await Event.collection.createIndex({ eventName: 1 }, { unique: true });
    await Event.collection.createIndex({ eventDate: 1 });
    await Event.collection.createIndex({ status: 1, eventDate: 1 });
    await Event.collection.createIndex({ eventName: "text", location: "text", description: "text" });
    
    // Índices para CheckIn
    await CheckIn.collection.createIndex({ ticketId: 1 }, { unique: true });
    await CheckIn.collection.createIndex({ eventId: 1, checkInTime: -1 });
    await CheckIn.collection.createIndex({ userId: 1, checkInTime: -1 });
    await CheckIn.collection.createIndex({ checkInTime: -1 });
    await CheckIn.collection.createIndex({ status: 1, eventId: 1 });
    
    // Nuevos índices para Ticket
    await Ticket.collection.createIndex({ eventId: 1, status: 1 });
    await Ticket.collection.createIndex({ checkInDate: -1 });
    
    console.log('✅ Índices creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
}

async function validateMigration() {
  try {
    console.log('🔍 Validando migración...');
    
    // Estadísticas generales
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const totalCheckIns = await CheckIn.countDocuments();
    const usedTickets = await Ticket.countDocuments({ isUsed: true });
    
    // Verificar consistencia
    const ticketsWithoutEventId = await Ticket.countDocuments({ 
      eventId: { $exists: false } 
    });
    
    const usedTicketsWithoutCheckIn = await Ticket.aggregate([
      { $match: { isUsed: true } },
      {
        $lookup: {
          from: 'checkins',
          localField: '_id',
          foreignField: 'ticketId',
          as: 'checkIn'
        }
      },
      { $match: { checkIn: { $size: 0 } } },
      { $count: "count" }
    ]);
    
    const orphanedCheckIns = usedTicketsWithoutCheckIn.length > 0 ? usedTicketsWithoutCheckIn[0].count : 0;
    
    console.log('📊 Estadísticas de validación:');
    console.log(`   🎪 Total eventos: ${totalEvents}`);
    console.log(`   🎫 Total tickets: ${totalTickets}`);
    console.log(`   ✅ Total check-ins: ${totalCheckIns}`);
    console.log(`   🔥 Tickets usados: ${usedTickets}`);
    console.log(`   ⚠️  Tickets sin eventId: ${ticketsWithoutEventId}`);
    console.log(`   ⚠️  Tickets usados sin check-in: ${orphanedCheckIns}`);
    
    // Validar capacidades de eventos
    console.log('\n🎪 Validando capacidades de eventos:');
    const events = await Event.find({}).sort({ eventName: 1 });
    
    for (const event of events) {
      const actualCheckIns = await CheckIn.countDocuments({
        eventId: event._id,
        status: 'successful'
      });
      
      const capacityStatus = event.currentCheckedIn === actualCheckIns ? '✅' : '⚠️';
      const occupancyPercentage = Math.round((actualCheckIns / event.maxCapacity) * 100);
      
      console.log(`   ${capacityStatus} ${event.eventName}: ${actualCheckIns}/${event.maxCapacity} (${occupancyPercentage}%)`);
    }
    
    if (ticketsWithoutEventId === 0 && orphanedCheckIns === 0) {
      console.log('\n✅ Migración validada exitosamente');
    } else {
      console.log('\n⚠️  Se encontraron inconsistencias que requieren revisión');
    }
    
  } catch (error) {
    console.error('❌ Error validando migración:', error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando migración de sistema de aforo y check-in');
  console.log('=' .repeat(60));
  
  await connectDB();
  
  console.log('\n1️⃣ Creando eventos basados en tickets...');
  await createEventsFromTickets();
  
  console.log('\n2️⃣ Migrando tickets usados a check-ins...');
  await migrateUsedTicketsToCheckIns();
  
  console.log('\n3️⃣ Actualizando capacidades de eventos...');
  await updateEventCapacities();
  
  console.log('\n4️⃣ Creando índices optimizados...');
  await createIndexes();
  
  console.log('\n5️⃣ Validando migración...');
  await validateMigration();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Migración de aforo y check-in completada');
  
  mongoose.connection.close();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en la migración:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEventsFromTickets, 
  migrateUsedTicketsToCheckIns, 
  updateEventCapacities,
  createIndexes, 
  validateMigration 
};
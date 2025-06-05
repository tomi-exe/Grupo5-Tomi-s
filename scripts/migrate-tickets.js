// Script de migración para actualizar tickets existentes
// Ejecutar con: node scripts/migrate-tickets.js

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

// Esquema temporal para la migración
const TicketSchema = new mongoose.Schema({
  eventName: String,
  eventDate: Date,
  price: Number,
  disp: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  currentOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  forSale: { type: Boolean, default: false },
  transferDate: Date,
  isUsed: { type: Boolean, default: false },
  sold: { type: Boolean, default: false },
  purchaseDate: { type: Date, default: Date.now },
  lastTransferDate: Date,
  transferCount: { type: Number, default: 0 },
  originalPrice: Number,
  status: { type: String, default: "active" }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);

async function migrateTickets() {
  try {
    console.log('🔄 Iniciando migración de tickets...');
    
    // Obtener todos los tickets
    const tickets = await Ticket.find({});
    console.log(`📋 Encontrados ${tickets.length} tickets para migrar`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const ticket of tickets) {
      let needsUpdate = false;
      const updates = {};
      
      // Si no tiene currentOwnerId, establecerlo igual a userId
      if (!ticket.currentOwnerId) {
        updates.currentOwnerId = ticket.userId;
        needsUpdate = true;
      }
      
      // Si no tiene originalPrice, establecerlo igual al precio actual
      if (!ticket.originalPrice) {
        updates.originalPrice = ticket.price;
        needsUpdate = true;
      }
      
      // Si no tiene purchaseDate, usar createdAt o fecha actual
      if (!ticket.purchaseDate) {
        updates.purchaseDate = ticket.createdAt || new Date();
        needsUpdate = true;
      }
      
      // Si no tiene transferCount, establecerlo en 0
      if (ticket.transferCount === undefined || ticket.transferCount === null) {
        updates.transferCount = 0;
        needsUpdate = true;
      }
      
      // Si no tiene status, establecerlo como "active"
      if (!ticket.status) {
        updates.status = ticket.isUsed ? 'used' : 'active';
        needsUpdate = true;
      }
      
      // Si transferDate existe pero no lastTransferDate, copiar la fecha
      if (ticket.transferDate && !ticket.lastTransferDate) {
        updates.lastTransferDate = ticket.transferDate;
        updates.transferCount = 1; // Indica que ha sido transferido al menos una vez
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        try {
          await Ticket.findByIdAndUpdate(ticket._id, updates);
          migratedCount++;
          
          if (migratedCount % 10 === 0) {
            console.log(`⏳ Migrados ${migratedCount}/${tickets.length} tickets...`);
          }
        } catch (error) {
          console.error(`❌ Error migrando ticket ${ticket._id}:`, error.message);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log('✅ Migración completada:');
    console.log(`   📊 Tickets migrados: ${migratedCount}`);
    console.log(`   ⏭️  Tickets omitidos: ${skippedCount}`);
    console.log(`   📋 Total procesados: ${migratedCount + skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creando índices optimizados...');
    
    // Índices para mejorar rendimiento
    await Ticket.collection.createIndex({ userId: 1, eventDate: -1 });
    await Ticket.collection.createIndex({ currentOwnerId: 1, eventDate: -1 });
    await Ticket.collection.createIndex({ forSale: 1, eventDate: 1 });
    await Ticket.collection.createIndex({ status: 1, eventDate: 1 });
    await Ticket.collection.createIndex({ eventName: "text" });
    
    console.log('✅ Índices creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Verificando migración...');
    
    // Verificar que todos los tickets tienen currentOwnerId
    const ticketsWithoutCurrentOwner = await Ticket.countDocuments({ 
      currentOwnerId: { $exists: false } 
    });
    
    // Verificar que todos los tickets tienen originalPrice
    const ticketsWithoutOriginalPrice = await Ticket.countDocuments({ 
      originalPrice: { $exists: false } 
    });
    
    // Verificar que todos los tickets tienen status
    const ticketsWithoutStatus = await Ticket.countDocuments({ 
      status: { $exists: false } 
    });
    
    console.log('📊 Verificación de migración:');
    console.log(`   🎫 Tickets sin currentOwnerId: ${ticketsWithoutCurrentOwner}`);
    console.log(`   💰 Tickets sin originalPrice: ${ticketsWithoutOriginalPrice}`);
    console.log(`   📋 Tickets sin status: ${ticketsWithoutStatus}`);
    
    if (ticketsWithoutCurrentOwner === 0 && ticketsWithoutOriginalPrice === 0 && ticketsWithoutStatus === 0) {
      console.log('✅ Migración verificada exitosamente');
    } else {
      console.log('⚠️  Algunos tickets no fueron migrados correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error verificando migración:', error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando proceso de migración de sistema de transferencias');
  console.log('=' .repeat(60));
  
  await connectDB();
  await migrateTickets();
  await createIndexes();
  await verifyMigration();
  
  console.log('=' .repeat(60));
  console.log('🏁 Proceso de migración completado');
  
  mongoose.connection.close();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal en la migración:', error);
    process.exit(1);
  });
}

module.exports = { migrateTickets, createIndexes, verifyMigration };
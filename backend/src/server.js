require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    // Attempt optional MongoDB connection if configured
    if (process.env.MONGODB_URI) {
      try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ Connected to MongoDB Activity Log database successfully.');
      } catch (mongoErr) {
        console.warn('⚠️  MongoDB connection skipped/unavailable:', mongoErr.message);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 CampusConnect API Server listening on http://localhost:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down CampusConnect API...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Prisma disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start CampusConnect server:', err);
    process.exit(1);
  }
}

startServer();

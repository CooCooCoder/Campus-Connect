const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'healthy';
  let latencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = 'degraded';
  }

  res.status(200).json({
    status: 'OK',
    service: 'CampusConnect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs
    },
    requestId: req.id
  });
});

module.exports = router;

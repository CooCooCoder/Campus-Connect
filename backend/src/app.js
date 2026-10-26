const express = require('express');
const cors = require('cors');

const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

const healthRoutes = require('./routes/healthRoutes');
const eventRoutes = require('./routes/eventRoutes');
const clubRoutes = require('./routes/clubRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

// Security and utility middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestId);
app.use(logger);

// Welcome root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'CampusConnect API',
    tagline: 'Campus Event & Club Management Portal',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      clubs: '/api/clubs',
      registrations: '/api/registrations'
    },
    requestId: req.id
  });
});

// REST API routes
app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/registrations', registrationRoutes);

// Catch-all 404 for undefined endpoints
app.use((req, res, next) => {
  next(new NotFoundError(`The requested endpoint '${req.originalUrl}' does not exist on this server.`));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;

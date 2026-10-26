const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const { validateEventCreate, validateEventUpdate } = require('../validators/eventValidator');
const { validateRegistration } = require('../validators/registrationValidator');

// Event endpoints
router.get('/', (req, res, next) => eventController.getEvents(req, res, next));
router.get('/:id', (req, res, next) => eventController.getEventById(req, res, next));
router.post('/', validateEventCreate, (req, res, next) => eventController.createEvent(req, res, next));
router.patch('/:id', validateEventUpdate, (req, res, next) => eventController.updateEvent(req, res, next));
router.delete('/:id', (req, res, next) => eventController.deleteEvent(req, res, next));

// Nested registration endpoints for an event
router.get('/:id/registrations', (req, res, next) => registrationController.getEventRegistrations(req, res, next));
router.post('/:id/registrations', validateRegistration, (req, res, next) => registrationController.registerForEvent(req, res, next));

module.exports = router;

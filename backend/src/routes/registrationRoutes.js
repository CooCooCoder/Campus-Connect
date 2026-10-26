const express = require('express');
const router = express.Router();

const registrationController = require('../controllers/registrationController');

router.get('/', (req, res, next) => registrationController.getAllRegistrations(req, res, next));
router.patch('/:id/cancel', (req, res, next) => registrationController.cancelRegistration(req, res, next));

module.exports = router;

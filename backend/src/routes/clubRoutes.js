const express = require('express');
const router = express.Router();

const clubController = require('../controllers/clubController');
const { validateClubCreate } = require('../validators/clubValidator');

router.get('/', (req, res, next) => clubController.getClubs(req, res, next));
router.get('/:id', (req, res, next) => clubController.getClubById(req, res, next));
router.post('/', validateClubCreate, (req, res, next) => clubController.createClub(req, res, next));

module.exports = router;

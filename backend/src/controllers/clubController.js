const clubService = require('../services/clubService');
const ApiResponse = require('../utils/apiResponse');

class ClubController {
  async getClubs(req, res, next) {
    try {
      const clubs = await clubService.getAllClubs();
      return ApiResponse.success(res, clubs, 'Clubs retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getClubById(req, res, next) {
    try {
      const club = await clubService.getClubById(req.params.id);
      return ApiResponse.success(res, club, 'Club details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createClub(req, res, next) {
    try {
      const club = await clubService.createClub(req.validatedBody);
      return ApiResponse.success(res, club, 'Club created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClubController();

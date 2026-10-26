const registrationService = require('../services/registrationService');
const ApiResponse = require('../utils/apiResponse');

class RegistrationController {
  async registerForEvent(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { studentName, studentEmail } = req.validatedBody;

      const result = await registrationService.registerForEvent(
        eventId,
        studentName,
        studentEmail
      );

      return ApiResponse.success(
        res,
        result,
        'Registration confirmed successfully! Your seat has been reserved.',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  async getEventRegistrations(req, res, next) {
    try {
      const registrations = await registrationService.getRegistrationsForEvent(req.params.id);
      return ApiResponse.success(
        res,
        registrations,
        'Registrations for event retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getAllRegistrations(req, res, next) {
    try {
      const registrations = await registrationService.getAllRegistrations(req.query);
      return ApiResponse.success(
        res,
        registrations,
        'Registrations retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async cancelRegistration(req, res, next) {
    try {
      const result = await registrationService.cancelRegistration(req.params.id);
      return ApiResponse.success(
        res,
        result,
        'Registration cancelled successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RegistrationController();

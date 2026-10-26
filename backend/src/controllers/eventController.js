const eventService = require('../services/eventService');
const ApiResponse = require('../utils/apiResponse');

class EventController {
  async getEvents(req, res, next) {
    try {
      const { events, pagination } = await eventService.getEvents(req.query);
      return ApiResponse.paginated(
        res,
        events,
        pagination,
        'Events retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      return ApiResponse.success(
        res,
        event,
        'Event details retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await eventService.createEvent(req.validatedBody);
      return ApiResponse.success(
        res,
        event,
        'Event created successfully',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const event = await eventService.updateEvent(req.params.id, req.validatedBody);
      return ApiResponse.success(
        res,
        event,
        'Event updated successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await eventService.deleteEvent(req.params.id);
      return ApiResponse.success(
        res,
        null,
        'Event deleted successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventController();

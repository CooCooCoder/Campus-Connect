const registrationRepository = require('../repositories/registrationRepository');
const eventRepository = require('../repositories/eventRepository');
const { NotFoundError } = require('../utils/errors');

class RegistrationService {
  async registerForEvent(eventId, studentName, studentEmail) {
    // 1. Execute concurrency-safe registration transaction in PostgreSQL / Prisma
    const result = await registrationRepository.createRegistrationWithCapacityCheck(
      eventId,
      studentName,
      studentEmail
    );

    // 2. Optional MongoDB Activity Log (Dual-write decoupled asynchronous pattern)
    this.logActivityAsync({
      action: 'REGISTRATION_SUCCESS',
      eventId,
      eventTitle: result.event.title,
      studentEmail,
      studentName,
      timestamp: new Date()
    });

    return result;
  }

  async getRegistrationsForEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID '${eventId}' not found.`);
    }
    return registrationRepository.findByEvent(eventId);
  }

  async getAllRegistrations(filters = {}) {
    return registrationRepository.findMany(filters);
  }

  async cancelRegistration(id) {
    return registrationRepository.cancelRegistration(id);
  }

  /**
   * Decoupled MongoDB audit logging helper
   * Fails gracefully to prevent secondary database issues from breaking core transactions
   */
  async logActivityAsync(activityData) {
    try {
      const ActivityLog = require('../../../mongodb/models/ActivityLog');
      if (ActivityLog) {
        await ActivityLog.create(activityData);
      }
    } catch (err) {
      // Intentionally log warning without blocking primary response (Dual-write mitigation)
      console.warn('[MongoDB Logging Notice]', err.message);
    }
  }
}

module.exports = new RegistrationService();

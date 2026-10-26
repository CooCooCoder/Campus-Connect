const prisma = require('../config/db');
const { ConflictError, NotFoundError, CapacityExceededError } = require('../utils/errors');

class RegistrationRepository {
  async findByEvent(eventId) {
    return prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findMany(filters = {}) {
    return prisma.registration.findMany({
      where: filters,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            venue: true,
            date: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByEventAndEmail(eventId, studentEmail) {
    return prisma.registration.findUnique({
      where: {
        eventId_studentEmail: {
          eventId,
          studentEmail
        }
      }
    });
  }

  /**
   * Concurrency-controlled atomic registration transaction
   * Uses compare-and-swap conditional update to guarantee event capacity invariant
   */
  async createRegistrationWithCapacityCheck(eventId, studentName, studentEmail) {
    return prisma.$transaction(async (tx) => {
      // 1. Check if event exists
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { club: { select: { name: true } } }
      });

      if (!event) {
        throw new NotFoundError(`Event with ID '${eventId}' not found.`);
      }

      if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
        throw new ConflictError(`Cannot register for an event that is ${event.status.toLowerCase()}.`);
      }

      // 2. Prevent duplicate registrations for the same student on this event
      const existing = await tx.registration.findUnique({
        where: {
          eventId_studentEmail: {
            eventId,
            studentEmail
          }
        }
      });

      if (existing) {
        throw new ConflictError(`Student with email '${studentEmail}' is already registered for this event.`);
      }

      // 3. Atomic conditional update: only increment if registeredCount is strictly less than capacity
      const updateResult = await tx.event.updateMany({
        where: {
          id: eventId,
          registeredCount: {
            lt: event.capacity
          }
        },
        data: {
          registeredCount: {
            increment: 1
          }
        }
      });

      // If count is 0, the event is full (concurrency race prevented)
      if (updateResult.count === 0) {
        throw new CapacityExceededError(`Event '${event.title}' has reached its maximum capacity of ${event.capacity} seats.`);
      }

      // 4. Create registration record
      const registration = await tx.registration.create({
        data: {
          eventId,
          studentName,
          studentEmail,
          status: 'CONFIRMED'
        }
      });

      // 5. Fetch updated event state
      const updatedEvent = await tx.event.findUnique({
        where: { id: eventId }
      });

      return {
        registration,
        event: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          capacity: updatedEvent.capacity,
          registeredCount: updatedEvent.registeredCount,
          remainingSeats: Math.max(0, updatedEvent.capacity - updatedEvent.registeredCount)
        }
      };
    });
  }

  async cancelRegistration(id) {
    return prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({ where: { id } });
      if (!reg) throw new NotFoundError('Registration not found.');
      if (reg.status === 'CANCELLED') throw new ConflictError('Registration already cancelled.');

      const updated = await tx.registration.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await tx.event.update({
        where: { id: reg.eventId },
        data: { registeredCount: { decrement: 1 } }
      });

      return updated;
    });
  }
}

module.exports = new RegistrationRepository();

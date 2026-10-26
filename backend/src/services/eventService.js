const eventRepository = require('../repositories/eventRepository');
const { NotFoundError } = require('../utils/errors');

class EventService {
  async getEvents(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    const where = {};

    // Search by title or description
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } }
      ];
    }

    // Filter by category
    if (query.category && query.category.trim() && query.category !== 'All') {
      where.category = query.category.trim();
    }

    // Filter by club ID or club name
    if (query.clubId) {
      where.clubId = query.clubId;
    } else if (query.club) {
      where.club = {
        name: { contains: query.club.trim() }
      };
    }

    // Filter by status
    if (query.status && ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(query.status)) {
      where.status = query.status;
    }

    // Sorting
    const sortBy = query.sortBy || 'date';
    const order = (query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const orderBy = {};

    if (['title', 'date', 'capacity', 'registeredCount', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = order;
    } else {
      orderBy.date = 'asc';
    }

    const [events, total] = await Promise.all([
      eventRepository.findMany({ where, skip, take: limit, orderBy }),
      eventRepository.count(where)
    ]);

    // Attach calculated availability metadata
    const eventsWithMeta = events.map(event => ({
      ...event,
      remainingSeats: Math.max(0, event.capacity - event.registeredCount),
      isFull: event.registeredCount >= event.capacity
    }));

    return {
      events: eventsWithMeta,
      pagination: {
        total,
        page,
        limit
      }
    };
  }

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError(`Event with ID '${id}' was not found.`);
    }

    return {
      ...event,
      remainingSeats: Math.max(0, event.capacity - event.registeredCount),
      isFull: event.registeredCount >= event.capacity
    };
  }

  async createEvent(data) {
    const event = await eventRepository.create(data);
    return {
      ...event,
      remainingSeats: event.capacity,
      isFull: false
    };
  }

  async updateEvent(id, data) {
    await this.getEventById(id); // ensure exists
    const updated = await eventRepository.update(id, data);
    return {
      ...updated,
      remainingSeats: Math.max(0, updated.capacity - updated.registeredCount),
      isFull: updated.registeredCount >= updated.capacity
    };
  }

  async deleteEvent(id) {
    await this.getEventById(id);
    return eventRepository.delete(id);
  }
}

module.exports = new EventService();

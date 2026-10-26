const prisma = require('../config/db');

class EventRepository {
  async findMany({ where = {}, skip = 0, take = 10, orderBy = { date: 'asc' } }) {
    // Single query with eager-loading 'club' to completely prevent N+1 query problem
    return prisma.event.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            logoUrl: true
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
  }

  async count(where = {}) {
    return prisma.event.count({ where });
  }

  async findById(id) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
        registrations: {
          select: {
            id: true,
            studentName: true,
            studentEmail: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async create(data) {
    return prisma.event.create({
      data,
      include: {
        club: true
      }
    });
  }

  async update(id, data) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        club: true
      }
    });
  }

  async delete(id) {
    return prisma.event.delete({
      where: { id }
    });
  }
}

module.exports = new EventRepository();

const prisma = require('../config/db');

class ClubRepository {
  async findMany() {
    return prisma.club.findMany({
      include: {
        _count: {
          select: { events: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id) {
    return prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { date: 'asc' }
        }
      }
    });
  }

  async findBySlug(slug) {
    return prisma.club.findUnique({
      where: { slug },
      include: {
        events: {
          orderBy: { date: 'asc' }
        }
      }
    });
  }

  async create(data) {
    return prisma.club.create({
      data
    });
  }
}

module.exports = new ClubRepository();

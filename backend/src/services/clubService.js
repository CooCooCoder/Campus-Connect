const clubRepository = require('../repositories/clubRepository');
const { NotFoundError } = require('../utils/errors');

class ClubService {
  async getAllClubs() {
    return clubRepository.findMany();
  }

  async getClubById(id) {
    const club = await clubRepository.findById(id);
    if (!club) {
      throw new NotFoundError(`Club with ID '${id}' was not found.`);
    }
    return club;
  }

  async getClubBySlug(slug) {
    const club = await clubRepository.findBySlug(slug);
    if (!club) {
      throw new NotFoundError(`Club with slug '${slug}' was not found.`);
    }
    return club;
  }

  async createClub(data) {
    return clubRepository.create(data);
  }
}

module.exports = new ClubService();

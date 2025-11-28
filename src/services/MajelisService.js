const MajelisRepository = require('../repositories/MajelisRepository');
const UserRepository = require('../repositories/UserRepository');
const Majelis = require('../core/Majelis');
const { MOCK_MAJELIS } = require('../config/mockData');

class MajelisService {
  async getMajelis(majelisId) {
    return MajelisRepository.findById(majelisId);
  }

  async getAllMajelis() {
    return MajelisRepository.findAll();
  }

  async createMajelis(data) {
    return MajelisRepository.create(data);
  }

  async updateMajelis(majelisId, data) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }
    return MajelisRepository.update(majelisId, data);
  }

  async deleteMajelis(majelisId) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      return false;
    }
    
    // Remove majelis reference from all members
    if (majelis.members && majelis.members.length > 0) {
      for (const phone of majelis.members) {
        await UserRepository.update(phone, {
          majelis_id: null,
          majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)"
        });
      }
    }
    
    await MajelisRepository.delete(majelisId);
    return true;
  }

  async addMember(majelisId, phoneNumber) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }

    const user = await UserRepository.findByPhone(phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_verified) {
      throw new Error('User must be verified before joining majelis');
    }

    if (user.majelis_id) {
      throw new Error('User already belongs to a majelis');
    }

    const members = majelis.members || [];
    if (members.includes(phoneNumber)) {
      throw new Error('User already in this majelis');
    }

    members.push(phoneNumber);
    await MajelisRepository.update(majelisId, { members });
    await UserRepository.update(phoneNumber, {
      majelis_id: majelisId,
      majelis_day: majelis.schedule_day
    });

    return MajelisRepository.findById(majelisId);
  }

  async removeMember(majelisId, phoneNumber) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }

    const members = (majelis.members || []).filter(m => m !== phoneNumber);
    await MajelisRepository.update(majelisId, { members });
    await UserRepository.update(phoneNumber, {
      majelis_id: null,
      majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)"
    });

    return MajelisRepository.findById(majelisId);
  }

  async deleteMockMajelis() {
    return MajelisRepository.deleteMany({ field: 'is_mock', operator: '==', value: true });
  }

  async createMockMajelis() {
    let count = 0;
    for (const majelisData of MOCK_MAJELIS) {
      const mockMajelis = Majelis.createMock(majelisData);
      await MajelisRepository.create(mockMajelis);
      count++;
    }
    console.log(`✅ Created ${count} mock majelis`);
    return count;
  }
}

module.exports = new MajelisService();

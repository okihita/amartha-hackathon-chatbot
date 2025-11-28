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
        await UserRepository.update(phone, { majelis_id: null });
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

    if (user.status !== 'active') {
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
    await UserRepository.update(phoneNumber, { majelis_id: majelisId });

    return MajelisRepository.findById(majelisId);
  }

  async removeMember(majelisId, phoneNumber) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }

    const members = (majelis.members || []).filter(m => m !== phoneNumber);
    await MajelisRepository.update(majelisId, { members });
    await UserRepository.update(phoneNumber, { majelis_id: null });

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

  // Attendance methods
  async recordAttendance(majelisId, data) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }
    return MajelisRepository.createAttendance(majelisId, data);
  }

  async getAttendance(majelisId, attendanceId) {
    return MajelisRepository.getAttendance(majelisId, attendanceId);
  }

  async getAllAttendance(majelisId) {
    const majelis = await MajelisRepository.findById(majelisId);
    if (!majelis) {
      throw new Error('Majelis not found');
    }
    return MajelisRepository.getAllAttendance(majelisId);
  }

  async updateAttendance(majelisId, attendanceId, data) {
    const attendance = await MajelisRepository.getAttendance(majelisId, attendanceId);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }
    return MajelisRepository.updateAttendance(majelisId, attendanceId, data);
  }

  async deleteAttendance(majelisId, attendanceId) {
    const attendance = await MajelisRepository.getAttendance(majelisId, attendanceId);
    if (!attendance) {
      return false;
    }
    await MajelisRepository.deleteAttendance(majelisId, attendanceId);
    return true;
  }
}

module.exports = new MajelisService();

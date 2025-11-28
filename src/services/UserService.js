/**
 * User Service - Single Responsibility Principle
 * Handles all user-related business logic
 */

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserContext(phoneNumber) {
    return await this.userRepository.findByPhone(phoneNumber);
  }

  async registerUser(phoneNumber, userData) {
    const user = {
      name: userData.name,
      business_type: userData.business_type,
      location: userData.location,
      majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)",
      current_module: "Welcome Phase",
      literacy_score: "Low",
      is_verified: false,
      loan_limit: 0,
      loan_used: 0,
      loan_remaining: 0,
      next_payment_date: null,
      next_payment_amount: 0,
      loan_history: [],
      created_at: new Date().toISOString(),
    };

    return await this.userRepository.create(phoneNumber, user);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async updateUserStatus(phoneNumber, status) {
    return await this.userRepository.updateStatus(phoneNumber, status);
  }

  async deleteUser(phoneNumber) {
    return await this.userRepository.delete(phoneNumber);
  }

  async updateUserMajelis(phoneNumber, majelisInfo) {
    return await this.userRepository.updateMajelis(phoneNumber, majelisInfo);
  }
}

module.exports = UserService;

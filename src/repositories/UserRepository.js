/**
 * User Repository - Data Access Layer
 * Handles Firestore operations for users
 */

class UserRepository {
  constructor(firestore, collectionName = 'users') {
    this.db = firestore;
    this.collection = collectionName;
  }

  cleanPhone(phoneNumber) {
    return phoneNumber.replace(/\D/g, '');
  }

  async findByPhone(phoneNumber) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      const userDoc = await this.db.collection(this.collection).doc(cleanPhone).get();
      if (!userDoc.exists) return null;
      return { phone: cleanPhone, ...userDoc.data() };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  async create(phoneNumber, userData) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      await this.db.collection(this.collection).doc(cleanPhone).set(userData);
      console.log(`🆕 User created: ${userData.name}`);
      return { phone: cleanPhone, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async findAll() {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({ phone: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  async updateStatus(phoneNumber, status) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      const userRef = this.db.collection(this.collection).doc(cleanPhone);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return null;
      
      await userRef.update({ is_verified: status });
      console.log(`🔄 User ${userDoc.data().name} status updated to ${status}`);
      
      const updatedDoc = await userRef.get();
      return { phone: cleanPhone, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating user status:', error);
      return null;
    }
  }

  async delete(phoneNumber) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      const userRef = this.db.collection(this.collection).doc(cleanPhone);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return false;
      
      await userRef.delete();
      console.log(`🗑️ User ${userDoc.data().name} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async updateMajelis(phoneNumber, majelisInfo) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      const userRef = this.db.collection(this.collection).doc(cleanPhone);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        await userRef.update(majelisInfo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user majelis:', error);
      return false;
    }
  }

  async update(phoneNumber, data) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    try {
      const userRef = this.db.collection(this.collection).doc(cleanPhone);
      await userRef.update(data);
      const updatedDoc = await userRef.get();
      return { phone: cleanPhone, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
}

module.exports = UserRepository;

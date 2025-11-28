const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');
const User = require('../core/User');

class UserRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async findByPhone(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const doc = await this.collection.doc(cleanPhone).get();
    return doc.exists ? { phone: cleanPhone, ...doc.data() } : null;
  }

  async create(phoneNumber, data) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userData = User.create(data);
    await this.collection.doc(cleanPhone).set(userData);
    return { phone: cleanPhone, ...userData };
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ phone: doc.id, ...doc.data() }));
  }

  async update(phoneNumber, data) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    await this.collection.doc(cleanPhone).update(data);
    return this.findByPhone(cleanPhone);
  }

  async delete(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    await this.collection.doc(cleanPhone).delete();
    return true;
  }

  async deleteMany(filter) {
    const snapshot = await this.collection.where(filter.field, filter.operator, filter.value).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
}

module.exports = new UserRepository();

const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');
const User = require('../core/User');
const phone = require('../utils/phone');

class UserRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async findByPhone(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const doc = await this.collection.doc(clean).get();
    return doc.exists ? { phone: clean, ...doc.data() } : null;
  }

  async create(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    const userData = User.create(data);
    await this.collection.doc(clean).set(userData);
    return { phone: clean, ...userData };
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ phone: doc.id, ...doc.data() }));
  }

  async update(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).update(data);
    return this.findByPhone(clean);
  }

  async delete(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).delete();
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

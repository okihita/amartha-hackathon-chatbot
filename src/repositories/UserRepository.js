const db = require('../config/database');
const { COLLECTIONS, USER_COLLECTIONS } = require('../config/constants');
const User = require('../core/User');
const phone = require('../utils/phone');

class UserRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async findByPhone(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    if (!phone.isValid(clean)) {
      throw new Error('Invalid phone number format');
    }
    
    const doc = await this.collection.doc(clean).get();
    if (!doc.exists) return null;

    const user = { phone: clean, ...doc.data() };
    
    // Fetch subcollections
    const [profile, business, loan, literacy] = await Promise.all([
      this.getProfile(clean),
      this.getBusiness(clean),
      this.getLoan(clean),
      this.getLiteracy(clean)
    ]);

    return { ...user, profile, business, loan, literacy };
  }

  async create(phoneNumber, userData) {
    const clean = phone.clean(phoneNumber);
    if (!phone.isValid(clean)) {
      throw new Error('Invalid phone number format');
    }
    
    const userDoc = User.create({ ...userData, phone: clean });
    await this.collection.doc(clean).set(userDoc);

    // Create subcollections
    await Promise.all([
      this.updateProfile(clean, User.createProfile(userData)),
      this.updateBusiness(clean, User.createBusiness(userData)),
      this.updateLoan(clean, User.createLoan()),
      this.updateLiteracy(clean, User.createLiteracy())
    ]);

    return this.findByPhone(clean);
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return Promise.all(
      snapshot.docs.map(doc => this.findByPhone(doc.id))
    );
  }

  async update(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).update({
      ...data,
      updated_at: new Date().toISOString()
    });
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

  // Profile subcollection
  async getProfile(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const doc = await this.collection.doc(clean).collection(USER_COLLECTIONS.PROFILE).doc('data').get();
    return doc.exists ? doc.data() : null;
  }

  async updateProfile(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).collection(USER_COLLECTIONS.PROFILE).doc('data').set({
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return this.getProfile(clean);
  }

  // Business subcollection
  async getBusiness(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const doc = await this.collection.doc(clean).collection(USER_COLLECTIONS.BUSINESS).doc('data').get();
    return doc.exists ? doc.data() : null;
  }

  async updateBusiness(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).collection(USER_COLLECTIONS.BUSINESS).doc('data').set({
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return this.getBusiness(clean);
  }

  // Loan subcollection
  async getLoan(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const doc = await this.collection.doc(clean).collection(USER_COLLECTIONS.LOAN).doc('data').get();
    return doc.exists ? doc.data() : null;
  }

  async updateLoan(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).collection(USER_COLLECTIONS.LOAN).doc('data').set({
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return this.getLoan(clean);
  }

  // Literacy subcollection
  async getLiteracy(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const doc = await this.collection.doc(clean).collection(USER_COLLECTIONS.LITERACY).doc('data').get();
    return doc.exists ? doc.data() : null;
  }

  async updateLiteracy(phoneNumber, data) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).collection(USER_COLLECTIONS.LITERACY).doc('data').set({
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return this.getLiteracy(clean);
  }
}

module.exports = new UserRepository();

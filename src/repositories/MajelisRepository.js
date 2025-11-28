const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');
const Majelis = require('../core/Majelis');

class MajelisRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.MAJELIS);
  }

  async findById(majelisId) {
    const doc = await this.collection.doc(majelisId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async create(data) {
    const majelisData = Majelis.create(data);
    const docRef = await this.collection.add(majelisData);
    return { id: docRef.id, ...majelisData };
  }

  async update(majelisId, data) {
    await this.collection.doc(majelisId).update({
      ...data,
      updated_at: new Date().toISOString()
    });
    return this.findById(majelisId);
  }

  async delete(majelisId) {
    await this.collection.doc(majelisId).delete();
    return true;
  }

  async deleteMany(filter) {
    const snapshot = await this.collection.where(filter.field, filter.operator, filter.value).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }

  async deleteAll() {
    const snapshot = await this.collection.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
}

module.exports = new MajelisRepository();

const db = require('../config/database');
const { COLLECTIONS, USER_COLLECTIONS } = require('../config/constants');
const phone = require('../utils/phone');

class BusinessIntelligenceRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async save(phoneNumber, data, imageUrl = null, caption = null) {
    const clean = phone.clean(phoneNumber);
    const biCollection = this.collection.doc(clean).collection(USER_COLLECTIONS.BUSINESS_INTELLIGENCE);
    
    const now = new Date().toISOString();
    const record = {
      user_phone: clean,
      type: data.type || 'general',
      data: data.extracted || {},
      source: {
        type: imageUrl ? 'image' : 'text',
        image_url: imageUrl,
        text: data.text || null,
        caption: caption
      },
      analysis_category: data.analysis_category || 'uncategorized',
      analyzed_at: now,
      created_at: now
    };
    
    const docRef = await biCollection.add(record);
    const result = { id: docRef.id, ...record };
    
    // Emit real-time update event
    if (global.dataEvents) {
      global.dataEvents.emit('update', { phone: clean, type: 'bi_added', data: result });
    }
    
    return result;
  }

  async findByUser(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const snapshot = await this.collection.doc(clean)
      .collection(USER_COLLECTIONS.BUSINESS_INTELLIGENCE)
      .orderBy('created_at', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByType(phoneNumber, type) {
    const clean = phone.clean(phoneNumber);
    const snapshot = await this.collection.doc(clean)
      .collection(USER_COLLECTIONS.BUSINESS_INTELLIGENCE)
      .where('type', '==', type)
      .orderBy('created_at', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteById(phoneNumber, biId) {
    const clean = phone.clean(phoneNumber);
    await this.collection.doc(clean).collection(USER_COLLECTIONS.BUSINESS_INTELLIGENCE).doc(biId).delete();
    return true;
  }
}

module.exports = new BusinessIntelligenceRepository();

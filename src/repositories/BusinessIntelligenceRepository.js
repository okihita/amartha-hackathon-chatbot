const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');
const phone = require('../utils/phone');

class BusinessIntelligenceRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async save(phoneNumber, data, imageData = null, imageId = null) {
    const clean = phone.clean(phoneNumber);
    const biCollection = this.collection.doc(clean).collection('business_intelligence');
    
    await biCollection.add({
      ...data,
      has_image: !!imageData,
      image_id: imageId,
      image_data: imageData,
      timestamp: new Date().toISOString()
    });
  }

  async findByUser(phoneNumber) {
    const clean = phone.clean(phoneNumber);
    const snapshot = await this.collection.doc(clean)
      .collection('business_intelligence')
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = new BusinessIntelligenceRepository();

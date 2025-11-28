const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');

class BusinessIntelligenceRepository {
  constructor() {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async save(phoneNumber, data, imageData = null, imageId = null) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userRef = this.collection.doc(cleanPhone);
    const biCollection = userRef.collection('business_intelligence');
    
    const biDoc = {
      ...data,
      has_image: !!imageData,
      image_id: imageId,
      image_data: imageData,
      timestamp: new Date().toISOString()
    };
    
    await biCollection.add(biDoc);
    return biDoc;
  }

  async findByUser(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userRef = this.collection.doc(cleanPhone);
    const snapshot = await userRef.collection('business_intelligence')
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = new BusinessIntelligenceRepository();

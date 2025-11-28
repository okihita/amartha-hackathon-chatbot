const db = require('../config/database');
const { COLLECTIONS } = require('../config/constants');

class RAGRepository {
  async getBusinessTypes() {
    const snapshot = await db.collection(COLLECTIONS.BUSINESS_CLASSIFICATIONS).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getFinancialLiteracy() {
    const snapshot = await db.collection(COLLECTIONS.FINANCIAL_LITERACY).get();
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return modules.sort((a, b) => (a.module_number || 999) - (b.module_number || 999));
  }
}

module.exports = new RAGRepository();

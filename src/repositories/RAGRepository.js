const db = require('../config/database');

class RAGRepository {
  async getBusinessTypes() {
    const snapshot = await db.collection('business_classifications').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getFinancialLiteracy() {
    const snapshot = await db.collection('financial_literacy').get();
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return modules.sort((a, b) => (a.module_number || 999) - (b.module_number || 999));
  }
}

module.exports = new RAGRepository();

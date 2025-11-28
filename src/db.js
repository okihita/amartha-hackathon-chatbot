const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

const USERS_COLLECTION = 'users';

// Helper to get User Context
async function getUserContext(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userDoc = await db.collection(USERS_COLLECTION).doc(cleanPhone).get();
    if (!userDoc.exists) {
      return null;
    }
    return { phone: cleanPhone, ...userDoc.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Helper to Register New User
async function registerNewUser(phoneNumber, data) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const userData = {
    name: data.name,
    business_type: data.business_type,
    location: data.location,
    majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)",
    current_module: "Welcome Phase",
    literacy_score: "Low",
    is_verified: false,
    pending_verification: null,
    verified_transactions: [],
    created_at: new Date().toISOString(),
  };
  
  try {
    await db.collection(USERS_COLLECTION).doc(cleanPhone).set(userData);
    console.log(`🆕 DB: User Registered: ${data.name}`);
    return { phone: cleanPhone, ...userData };
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

// Helper to Get All Users (for Admin Dashboard)
async function getAllUsers() {
  try {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ phone: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Helper to Update User Status
async function updateUserStatus(phoneNumber, status) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    await userRef.update({ is_verified: status });
    console.log(`🔄 DB: User ${userDoc.data().name} status updated to ${status}`);
    
    const updatedDoc = await userRef.get();
    return { phone: cleanPhone, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating user status:', error);
    return null;
  }
}

// Helper to Delete User
async function deleteUser(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    await userRef.delete();
    console.log(`🗑️ DB: User ${userDoc.data().name} deleted`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

module.exports = { getUserContext, registerNewUser, getAllUsers, updateUserStatus, deleteUser };
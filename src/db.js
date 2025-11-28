const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

const USERS_COLLECTION = 'users';
const MAJELIS_COLLECTION = 'majelis';

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

// ===== MAJELIS MANAGEMENT =====

// Get all Majelis
async function getAllMajelis() {
  try {
    const snapshot = await db.collection(MAJELIS_COLLECTION).get();
    const majelis = [];
    snapshot.forEach(doc => {
      majelis.push({ id: doc.id, ...doc.data() });
    });
    return majelis;
  } catch (error) {
    console.error('Error getting all majelis:', error);
    return [];
  }
}

// Get single Majelis
async function getMajelis(majelisId) {
  try {
    const doc = await db.collection(MAJELIS_COLLECTION).doc(majelisId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting majelis:', error);
    return null;
  }
}

// Create Majelis
async function createMajelis(data) {
  try {
    const majelisData = {
      name: data.name,
      description: data.description || '',
      schedule_day: data.schedule_day, // e.g., "Selasa"
      schedule_time: data.schedule_time || '10:00',
      location: data.location || '',
      members: data.members || [], // Array of phone numbers
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const docRef = await db.collection(MAJELIS_COLLECTION).add(majelisData);
    console.log(`✨ Majelis created: ${data.name} (${docRef.id})`);
    return { id: docRef.id, ...majelisData };
  } catch (error) {
    console.error('Error creating majelis:', error);
    return null;
  }
}

// Update Majelis
async function updateMajelis(majelisId, data) {
  try {
    const majelisRef = db.collection(MAJELIS_COLLECTION).doc(majelisId);
    const doc = await majelisRef.get();
    
    if (!doc.exists) return null;
    
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    await majelisRef.update(updateData);
    console.log(`🔄 Majelis updated: ${majelisId}`);
    
    const updatedDoc = await majelisRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating majelis:', error);
    return null;
  }
}

// Delete Majelis
async function deleteMajelis(majelisId) {
  try {
    const majelisRef = db.collection(MAJELIS_COLLECTION).doc(majelisId);
    const doc = await majelisRef.get();
    
    if (!doc.exists) return false;
    
    await majelisRef.delete();
    console.log(`🗑️ Majelis deleted: ${majelisId}`);
    return true;
  } catch (error) {
    console.error('Error deleting majelis:', error);
    return false;
  }
}

// Add member to Majelis
async function addMemberToMajelis(majelisId, phoneNumber) {
  try {
    const majelisRef = db.collection(MAJELIS_COLLECTION).doc(majelisId);
    const doc = await majelisRef.get();
    
    if (!doc.exists) return null;
    
    // Check if user is already in another Majelis
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (userDoc.exists && userDoc.data().majelis_id) {
      const currentMajelisId = userDoc.data().majelis_id;
      if (currentMajelisId !== majelisId) {
        console.log(`⚠️ User ${phoneNumber} already in Majelis ${currentMajelisId}`);
        return { error: 'User already belongs to another Majelis', currentMajelisId };
      }
    }
    
    const members = doc.data().members || [];
    if (!members.includes(phoneNumber)) {
      members.push(phoneNumber);
      await majelisRef.update({ 
        members,
        updated_at: new Date().toISOString()
      });
      
      // Update user's majelis info (name, day, id)
      const majelisData = doc.data();
      await updateUserMajelis(phoneNumber, {
        majelis_id: majelisId,
        majelis_name: majelisData.name,
        majelis_day: majelisData.schedule_day
      });
      
      console.log(`➕ Added ${phoneNumber} to Majelis ${majelisId}`);
    }
    
    const updatedDoc = await majelisRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error adding member to majelis:', error);
    return null;
  }
}

// Remove member from Majelis
async function removeMemberFromMajelis(majelisId, phoneNumber) {
  try {
    const majelisRef = db.collection(MAJELIS_COLLECTION).doc(majelisId);
    const doc = await majelisRef.get();
    
    if (!doc.exists) return null;
    
    const members = doc.data().members || [];
    const updatedMembers = members.filter(m => m !== phoneNumber);
    
    await majelisRef.update({ 
      members: updatedMembers,
      updated_at: new Date().toISOString()
    });
    
    // Reset user's majelis info
    await updateUserMajelis(phoneNumber, {
      majelis_id: null,
      majelis_name: null,
      majelis_day: 'BELUM VERIFIKASI (Hubungi Petugas)'
    });
    
    console.log(`➖ Removed ${phoneNumber} from Majelis ${majelisId}`);
    
    const updatedDoc = await majelisRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error removing member from majelis:', error);
    return null;
  }
}

// Helper: Update user's majelis info
async function updateUserMajelis(phoneNumber, majelisInfo) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update(majelisInfo);
    }
  } catch (error) {
    console.error('Error updating user majelis:', error);
  }
}

module.exports = { 
  getUserContext, 
  registerNewUser, 
  getAllUsers, 
  updateUserStatus, 
  deleteUser,
  getAllMajelis,
  getMajelis,
  createMajelis,
  updateMajelis,
  deleteMajelis,
  addMemberToMajelis,
  removeMemberFromMajelis
};
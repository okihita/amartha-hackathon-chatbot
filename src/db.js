const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

const USERS_COLLECTION = 'users';
const MAJELIS_COLLECTION = 'majelis';
const BUSINESS_INTELLIGENCE_COLLECTION = 'business_intelligence';

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
    // Loan fields
    loan_limit: 0,
    loan_used: 0,
    loan_remaining: 0,
    next_payment_date: null,
    next_payment_amount: 0,
    loan_history: [],
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
    
    const majelisData = doc.data();
    const members = majelisData.members || [];
    
    // Clear majelis association from all members
    const batch = db.batch();
    for (const phone of members) {
      const userRef = db.collection(USERS_COLLECTION).doc(phone);
      batch.update(userRef, {
        majelis_id: null
      });
    }
    
    // Delete the majelis
    batch.delete(majelisRef);
    await batch.commit();
    
    console.log(`🗑️ Majelis deleted: ${majelisId}, cleared ${members.length} member associations`);
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
      
      // Update user's majelis info (only ID)
      await updateUserMajelis(phoneNumber, {
        majelis_id: majelisId
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
      majelis_id: null
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

// ===== LOAN MANAGEMENT =====

// Populate loan data for a user (for testing/demo)
async function populateLoanData(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { error: 'User not found' };
    }
    
    // Generate sample loan data
    const loanAmount = 2000000; // Rp 2 juta
    const installmentAmount = 150000; // Rp 150k per week
    const totalInstallments = 14; // 14 weeks
    const paidInstallments = 5; // Already paid 5
    
    const loanHistory = [
      {
        id: `loan-${Date.now()}`,
        type: 'disbursement',
        amount: loanAmount,
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        description: 'Pinjaman Tahap 1'
      }
    ];
    
    // Add payment history
    for (let i = 0; i < paidInstallments; i++) {
      loanHistory.push({
        id: `payment-${Date.now()}-${i}`,
        type: 'payment',
        amount: installmentAmount,
        date: new Date(Date.now() - (28 - i * 7) * 24 * 60 * 60 * 1000).toISOString(),
        description: `Cicilan minggu ke-${i + 1}`
      });
    }
    
    const totalPaid = paidInstallments * installmentAmount;
    const remainingDebt = loanAmount - totalPaid;
    const nextPaymentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next week
    
    const loanData = {
      loan_limit: 5000000, // Rp 5 juta limit
      loan_used: loanAmount,
      loan_remaining: 5000000 - loanAmount,
      next_payment_date: nextPaymentDate,
      next_payment_amount: installmentAmount,
      remaining_debt: remainingDebt,
      loan_history: loanHistory,
      updated_at: new Date().toISOString()
    };
    
    await userRef.update(loanData);
    console.log(`💰 Loan data populated for ${userDoc.data().name}`);
    
    return { success: true, data: loanData };
  } catch (error) {
    console.error('Error populating loan data:', error);
    return { error: 'Failed to populate loan data' };
  }
}

// ===== BUSINESS INTELLIGENCE =====

// Save business intelligence data from image analysis
async function saveBusinessIntelligence(phoneNumber, data, imageData = null, imageId = null) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const biData = {
      user_phone: cleanPhone,
      category: data.category,
      confidence: data.confidence,
      extracted_data: data.extracted_data,
      credit_metrics: data.credit_metrics,
      insights: data.insights,
      recommendations: data.recommendations,
      user_business_type: data.user_business_type,
      user_location: data.user_location,
      analyzed_at: data.analyzed_at || new Date().toISOString(),
      // Store image data for building and inventory photos
      image_data: imageData,
      image_id: imageId,
      has_image: imageData !== null
    };
    
    await db.collection(BUSINESS_INTELLIGENCE_COLLECTION).add(biData);
    console.log(`💾 Business intelligence saved for ${cleanPhone}: ${data.category}`);
    
    // Update user's credit score aggregate
    await updateUserCreditScore(cleanPhone);
    
    return true;
  } catch (error) {
    console.error('Error saving business intelligence:', error);
    return false;
  }
}

// Get all business intelligence for a user
async function getUserBusinessIntelligence(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const snapshot = await db.collection(BUSINESS_INTELLIGENCE_COLLECTION)
      .where('user_phone', '==', cleanPhone)
      .orderBy('analyzed_at', 'desc')
      .get();
    
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    
    return data;
  } catch (error) {
    console.error('Error getting business intelligence:', error);
    return [];
  }
}

// Update user's aggregate credit score based on all business intelligence
async function updateUserCreditScore(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const biData = await getUserBusinessIntelligence(cleanPhone);
    
    if (biData.length === 0) return;
    
    // Calculate aggregate scores
    let totalHealthScore = 0;
    let totalAssetScore = 0;
    let totalCashflowScore = 0;
    let totalManagementScore = 0;
    let totalGrowthPotential = 0;
    let count = 0;
    
    let totalAssetValue = 0;
    let totalInventoryValue = 0;
    let estimatedMonthlyCashflow = 0;
    
    biData.forEach(item => {
      if (item.credit_metrics) {
        const m = item.credit_metrics;
        if (m.business_health_score) {
          totalHealthScore += m.business_health_score;
          count++;
        }
        if (m.asset_score) totalAssetScore += m.asset_score;
        if (m.cashflow_score) totalCashflowScore += m.cashflow_score;
        if (m.management_score) totalManagementScore += m.management_score;
        if (m.growth_potential) totalGrowthPotential += m.growth_potential;
      }
      
      // Aggregate financial data
      if (item.extracted_data) {
        const ed = item.extracted_data;
        if (ed.estimated_value) totalAssetValue += ed.estimated_value;
        if (ed.inventory_value_estimate) totalInventoryValue += ed.inventory_value_estimate;
        if (ed.monthly_cashflow_estimate) estimatedMonthlyCashflow += ed.monthly_cashflow_estimate;
      }
    });
    
    const avgHealthScore = count > 0 ? Math.round(totalHealthScore / count) : 0;
    const avgAssetScore = count > 0 ? Math.round(totalAssetScore / count) : 0;
    const avgCashflowScore = count > 0 ? Math.round(totalCashflowScore / count) : 0;
    const avgManagementScore = count > 0 ? Math.round(totalManagementScore / count) : 0;
    const avgGrowthPotential = count > 0 ? Math.round(totalGrowthPotential / count) : 0;
    
    // Calculate overall credit score (weighted average)
    const overallCreditScore = Math.round(
      (avgHealthScore * 0.3) +
      (avgAssetScore * 0.2) +
      (avgCashflowScore * 0.3) +
      (avgManagementScore * 0.1) +
      (avgGrowthPotential * 0.1)
    );
    
    // Determine risk level
    let riskLevel = 'tinggi';
    if (overallCreditScore >= 70) riskLevel = 'rendah';
    else if (overallCreditScore >= 50) riskLevel = 'sedang';
    
    // Calculate recommended loan based on credit score and assets
    const baseRecommendation = totalAssetValue + totalInventoryValue;
    const scoreMultiplier = overallCreditScore / 100;
    const recommendedLoan = Math.round(baseRecommendation * scoreMultiplier * 0.5); // 50% of assets
    
    // Update user document
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    await userRef.update({
      credit_score: overallCreditScore,
      credit_metrics: {
        business_health_score: avgHealthScore,
        asset_score: avgAssetScore,
        cashflow_score: avgCashflowScore,
        management_score: avgManagementScore,
        growth_potential: avgGrowthPotential,
        risk_level: riskLevel,
        total_asset_value: totalAssetValue,
        total_inventory_value: totalInventoryValue,
        estimated_monthly_cashflow: estimatedMonthlyCashflow,
        recommended_loan_amount: recommendedLoan,
        last_updated: new Date().toISOString(),
        data_points: biData.length
      }
    });
    
    console.log(`📊 Credit score updated for ${cleanPhone}: ${overallCreditScore}/100`);
  } catch (error) {
    console.error('Error updating credit score:', error);
  }
}

// ===== BUSINESS PROFILE MANAGEMENT =====

// Update user's business profile with asset and cashflow predictions
async function updateUserBusinessProfile(phoneNumber, structuredData) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(cleanPhone);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log(`⚠️ User ${cleanPhone} not found for profile update`);
      return false;
    }
    
    const userData = userDoc.data();
    const category = structuredData.category;
    const extractedData = structuredData.extracted_data || {};
    const creditMetrics = structuredData.credit_metrics || {};
    
    // Initialize business_profile if not exists
    let businessProfile = userData.business_profile || {
      total_asset_value: 0,
      building_value: 0,
      inventory_value: 0,
      estimated_monthly_cashflow: 0,
      estimated_daily_revenue: 0,
      last_updated: null,
      data_sources: []
    };
    
    // Update based on category
    if (category === 'building') {
      const buildingValue = extractedData.estimated_value || 0;
      businessProfile.building_value = buildingValue;
      businessProfile.data_sources.push({
        type: 'building',
        date: new Date().toISOString(),
        value: buildingValue
      });
      console.log(`🏪 Building value updated: Rp ${buildingValue.toLocaleString('id-ID')}`);
    }
    
    if (category === 'inventory') {
      const inventoryValue = extractedData.inventory_value_estimate || 0;
      businessProfile.inventory_value = inventoryValue;
      
      // Estimate daily revenue based on inventory turnover
      const turnover = extractedData.turnover_indicator || 'sedang';
      const turnoverMultiplier = {
        'cepat': 0.3,    // 30% of inventory per day
        'sedang': 0.15,  // 15% of inventory per day
        'lambat': 0.05   // 5% of inventory per day
      };
      const dailyRevenue = Math.round(inventoryValue * (turnoverMultiplier[turnover] || 0.15));
      businessProfile.estimated_daily_revenue = dailyRevenue;
      
      // Estimate monthly cashflow (daily revenue * 25 working days * 30% profit margin)
      const monthlyCashflow = Math.round(dailyRevenue * 25 * 0.3);
      businessProfile.estimated_monthly_cashflow = monthlyCashflow;
      
      businessProfile.data_sources.push({
        type: 'inventory',
        date: new Date().toISOString(),
        value: inventoryValue,
        daily_revenue: dailyRevenue,
        monthly_cashflow: monthlyCashflow
      });
      
      console.log(`📦 Inventory value: Rp ${inventoryValue.toLocaleString('id-ID')}`);
      console.log(`💰 Estimated daily revenue: Rp ${dailyRevenue.toLocaleString('id-ID')}`);
      console.log(`📊 Estimated monthly cashflow: Rp ${monthlyCashflow.toLocaleString('id-ID')}`);
    }
    
    // Calculate total asset value
    businessProfile.total_asset_value = businessProfile.building_value + businessProfile.inventory_value;
    businessProfile.last_updated = new Date().toISOString();
    
    // Calculate recommended loan based on assets and cashflow
    const assetBasedLoan = Math.round(businessProfile.total_asset_value * 0.4); // 40% of assets
    const cashflowBasedLoan = Math.round(businessProfile.estimated_monthly_cashflow * 3); // 3 months cashflow
    const recommendedLoan = Math.min(assetBasedLoan, cashflowBasedLoan); // Conservative approach
    
    // Update user document
    await userRef.update({
      business_profile: businessProfile,
      recommended_loan_amount: recommendedLoan > 0 ? recommendedLoan : userData.recommended_loan_amount || 0,
      profile_updated_at: new Date().toISOString()
    });
    
    console.log(`✅ Business profile updated for ${userData.name}`);
    console.log(`   Total Assets: Rp ${businessProfile.total_asset_value.toLocaleString('id-ID')}`);
    console.log(`   Monthly Cashflow: Rp ${businessProfile.estimated_monthly_cashflow.toLocaleString('id-ID')}`);
    console.log(`   Recommended Loan: Rp ${recommendedLoan.toLocaleString('id-ID')}`);
    
    return true;
  } catch (error) {
    console.error('Error updating business profile:', error);
    return false;
  }
}

// Create mock users for testing
async function createMockUsers() {
  const mockUsers = [
    { name: 'Siti Nurhaliza', phone: '6281234567801', business_type: 'Warung Kelontong', location: 'Jakarta Selatan' },
    { name: 'Dewi Lestari', phone: '6281234567802', business_type: 'Toko Pakaian', location: 'Bandung' },
    { name: 'Rina Susanti', phone: '6281234567803', business_type: 'Warung Makan', location: 'Surabaya' },
    { name: 'Maya Sari', phone: '6281234567804', business_type: 'Salon Kecantikan', location: 'Yogyakarta' },
    { name: 'Ani Wijaya', phone: '6281234567805', business_type: 'Toko Kue', location: 'Semarang' },
    { name: 'Fitri Handayani', phone: '6281234567806', business_type: 'Laundry', location: 'Malang' },
    { name: 'Ratna Dewi', phone: '6281234567807', business_type: 'Toko Bunga', location: 'Solo' },
    { name: 'Sri Wahyuni', phone: '6281234567808', business_type: 'Warung Kopi', location: 'Medan' },
  ];

  let count = 0;
  for (const user of mockUsers) {
    const userRef = db.collection('users').doc(user.phone);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      await userRef.set({
        ...user,
        status: 'pending',
        is_mock: true,
        registered_at: new Date().toISOString(),
        majelis_id: null
      });
      count++;
    }
  }
  
  console.log(`✅ Created ${count} mock users`);
  return count;
}

// Delete all mock users
async function deleteAllMockUsers() {
  const snapshot = await db.collection('users').where('is_mock', '==', true).get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`🗑️ Deleted ${snapshot.size} mock users`);
  return snapshot.size;
}

// Create mock majelis for testing
async function createMockMajelis() {
  const mockMajelis = [
    { name: 'Majelis Sejahtera', description: 'Kelompok UMKM Jakarta Selatan', schedule_day: 'Senin', schedule_time: '10:00', location: 'Balai Desa Kebayoran' },
    { name: 'Majelis Berkah', description: 'Kelompok UMKM Bandung', schedule_day: 'Selasa', schedule_time: '14:00', location: 'Gedung Serbaguna Dago' },
    { name: 'Majelis Mandiri', description: 'Kelompok UMKM Surabaya', schedule_day: 'Rabu', schedule_time: '09:00', location: 'Balai RW 05' },
  ];

  let count = 0;
  for (const majelis of mockMajelis) {
    const majelisRef = db.collection('majelis').doc();
    await majelisRef.set({
      ...majelis,
      members: [],
      is_mock: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    count++;
  }
  
  console.log(`✅ Created ${count} mock majelis`);
  return count;
}

// Delete all mock majelis
async function deleteAllMockMajelis() {
  const snapshot = await db.collection('majelis').where('is_mock', '==', true).get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`🗑️ Deleted ${snapshot.size} mock majelis`);
  return snapshot.size;
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
  removeMemberFromMajelis,
  populateLoanData,
  saveBusinessIntelligence,
  getUserBusinessIntelligence,
  updateUserCreditScore,
  updateUserBusinessProfile,
  createMockUsers,
  deleteAllMockUsers,
  createMockMajelis,
  deleteAllMockMajelis
};
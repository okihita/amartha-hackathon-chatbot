// 📦 MOCK DATABASE (Stateful)
const userDatabase = {
  "628567881764": {
    name: "Ibu Marsinah",
    business_type: "Warung Sembako",
    location: "Sragen",
    majelis_day: "Selasa", // Verified Field
    current_module: "Module 4: Scaling Up",
    literacy_score: "Medium",
    is_verified: true, // ✨ Status Flag
    pending_verification: null,
    verified_transactions: []
  }
};

// Helper to get User Context
function getUserContext(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return userDatabase[cleanPhone] || null; // Return null if new user
}

// Helper to Register New User
function registerNewUser(phoneNumber, data) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  userDatabase[cleanPhone] = {
    name: data.name,
    business_type: data.business_type,
    location: data.location,
    majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)", // Locked Field
    current_module: "Welcome Phase",
    literacy_score: "Low",
    is_verified: false, // New users are unverified
    pending_verification: null,
    verified_transactions: []
  };
  console.log(`🆕 DB: User Registered: ${data.name}`);
  return userDatabase[cleanPhone];
}

// Helper to Get All Users (for Admin Dashboard)
function getAllUsers() {
  return Object.entries(userDatabase).map(([phone, data]) => ({
    phone,
    ...data
  }));
}

// Helper to Update User Status
function updateUserStatus(phoneNumber, status) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (userDatabase[cleanPhone]) {
    userDatabase[cleanPhone].is_verified = status;
    console.log(`🔄 DB: User ${userDatabase[cleanPhone].name} status updated to ${status}`);
    return { phone: cleanPhone, ...userDatabase[cleanPhone] };
  }
  return null;
}

module.exports = { getUserContext, registerNewUser, getAllUsers, updateUserStatus };
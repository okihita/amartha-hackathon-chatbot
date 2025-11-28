module.exports = {
  clean: (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    // Normalize to 62 format
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  },
  
  isValid: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Indonesian phone: 10-15 digits, starts with 62 or 0
    return /^(62|0)\d{9,14}$/.test(cleaned);
  }
};


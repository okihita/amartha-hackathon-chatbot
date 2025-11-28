module.exports = {
  clean: (phone) => phone.replace(/\D/g, ''),
  
  isValid: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Indonesian phone: 10-15 digits, starts with 62 or 0
    return /^(62|0)\d{9,14}$/.test(cleaned);
  }
};


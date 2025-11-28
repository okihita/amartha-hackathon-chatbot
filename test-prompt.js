#!/usr/bin/env node
require('dotenv').config();
const { getGeminiResponse } = require('./src/chatbot/aiEngine');

const phone = process.argv[2] || '6281234567890';
const message = process.argv[3] || 'halo';

console.log(`\n📱 Phone: ${phone}`);
console.log(`💬 Message: ${message}\n`);
console.log('─'.repeat(50));

getGeminiResponse(message, phone)
  .then(response => {
    console.log('\n🤖 Response:\n');
    console.log(response);
    console.log('\n' + '─'.repeat(50));
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });

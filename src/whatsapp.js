const axios = require('axios');

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

async function sendMessage(to, text) {
  try {
    if (!text || typeof text !== 'string') text = "Maaf, ada gangguan teknis.";
    if (text.length > 4000) text = text.substring(0, 3990) + '...';
    
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '*$1*').replace(/^[\*\-]\s/gm, '• ');

    await axios.post(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: formattedText },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error('❌ Send Failed:', error.message);
  }
}

module.exports = { sendMessage };
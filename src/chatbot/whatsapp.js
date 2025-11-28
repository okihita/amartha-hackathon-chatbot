const axios = require('axios');

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const GRAPH_API_VERSION = 'v24.0';

async function sendMessage(to, text) {
  try {
    if (!text || typeof text !== 'string') text = "Maaf, ada gangguan teknis.";
    if (text.length > 4000) text = text.substring(0, 3990) + '...';
    
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '*$1*').replace(/^[\*\-]\s/gm, '• ');

    await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
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

// Send interactive list message (for quiz questions)
async function sendListMessage(to, bodyText, buttonText, options) {
  try {
    const rows = options.map((opt, idx) => ({
      id: `opt_${idx}`,
      title: opt.title || `${String.fromCharCode(65 + idx)}`,
      description: opt.description || opt.text
    }));

    await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: bodyText },
          action: {
            button: buttonText,
            sections: [{ rows }]
          }
        }
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error('❌ List Message Failed:', error.message);
  }
}

// Send quiz question with options
async function sendQuizQuestion(to, question, questionNumber, totalQuestions) {
  const options = question.options.map((opt, idx) => ({
    title: String.fromCharCode(65 + idx), // A, B, C, D
    description: opt.length > 72 ? opt.substring(0, 69) + '...' : opt
  }));

  const bodyText = `📚 Pertanyaan ${questionNumber}/${totalQuestions}\n\n${question.question}`;
  
  return sendListMessage(to, bodyText, '📝 Pilih Jawaban', options);
}

module.exports = { sendMessage, sendListMessage, sendQuizQuestion, GRAPH_API_VERSION };
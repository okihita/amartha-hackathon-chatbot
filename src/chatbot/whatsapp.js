const axios = require('axios');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const GCS_BUCKET = process.env.GCS_BUCKET;
const GRAPH_API_VERSION = 'v24.0';

// Initialize TTS and Storage clients
const ttsClient = new textToSpeech.TextToSpeechClient();
const storage = new Storage();

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

async function sendAudio(to, audioUrl) {
  try {
    await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'audio',
        audio: { link: audioUrl }
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error('❌ Audio Send Failed:', error.message);
  }
}

async function generateVoice(text) {
  if (!GCS_BUCKET) {
    console.warn('⚠️ GCS_BUCKET not set, skipping voice generation');
    return null;
  }
  
  try {
    const ttsText = text.length > 500 ? text.substring(0, 500) + '...' : text;
    
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: ttsText },
      voice: { languageCode: 'id-ID', name: 'id-ID-Wavenet-D' }, // Female voice, warmer tone
      audioConfig: { 
        audioEncoding: 'OGG_OPUS',
        speakingRate: 1.15, // Slightly faster (0.25-4.0, default 1.0)
        pitch: 1.0, // Natural pitch (-20 to 20)
      },
    });

    const filename = `voice/${Date.now()}.ogg`;
    const bucket = storage.bucket(GCS_BUCKET);
    const file = bucket.file(filename);
    
    await file.save(response.audioContent, { contentType: 'audio/ogg' });

    return `https://storage.googleapis.com/${GCS_BUCKET}/${filename}`;
  } catch (error) {
    console.error('❌ TTS Failed:', error.message);
    return null;
  }
}

async function sendMessageWithVoice(to, text) {
  // Send text first, wait for completion
  await sendMessage(to, text);
  
  // Then generate and send audio
  const audioUrl = await generateVoice(text);
  if (audioUrl) {
    await sendAudio(to, audioUrl);
  }
}

// Strip formatting for clean TTS
function stripFormatting(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.*?)\*/g, '$1')       // *italic*
    .replace(/_(.*?)_/g, '$1')         // _underline_
    .replace(/~(.*?)~/g, '$1')         // ~strikethrough~
    .replace(/```[\s\S]*?```/g, '')    // code blocks
    .replace(/`(.*?)`/g, '$1')         // inline code
    .replace(/^[\•\-\*]\s/gm, '')      // bullet points
    .replace(/^\d+\.\s/gm, '')         // numbered lists
    .replace(/\n{3,}/g, '\n\n')        // excessive newlines
    .trim();
}

async function sendVoiceOnly(to, text) {
  const cleanText = stripFormatting(text);
  const audioUrl = await generateVoice(cleanText);
  if (audioUrl) {
    await sendAudio(to, audioUrl);
  } else {
    // Fallback to text if TTS fails
    await sendMessage(to, text);
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

module.exports = { sendMessage, sendAudio, sendMessageWithVoice, sendVoiceOnly, generateVoice, sendListMessage, sendQuizQuestion, GRAPH_API_VERSION };
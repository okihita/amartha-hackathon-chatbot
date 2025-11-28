const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const { GRAPH_API_VERSION } = require('./whatsapp');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const WA_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: { maxOutputTokens: 500, temperature: 0.1 }
});

async function downloadWhatsAppAudio(audioId) {
  try {
    const mediaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${audioId}`;
    const urlResponse = await axios.get(mediaUrl, {
      headers: { 'Authorization': `Bearer ${WA_ACCESS_TOKEN}` }
    });
    
    const audioResponse = await axios.get(urlResponse.data.url, {
      headers: { 'Authorization': `Bearer ${WA_ACCESS_TOKEN}` },
      responseType: 'arraybuffer'
    });
    
    return {
      buffer: Buffer.from(audioResponse.data),
      mimeType: urlResponse.data.mime_type || 'audio/ogg'
    };
  } catch (error) {
    console.error('Error downloading audio:', error.message);
    return null;
  }
}

async function transcribeVoiceNote(audioId) {
  try {
    const audio = await downloadWhatsAppAudio(audioId);
    if (!audio) return null;

    const audioPart = {
      inlineData: {
        data: audio.buffer.toString('base64'),
        mimeType: audio.mimeType
      }
    };

    const result = await model.generateContent([
      "Transcribe this Indonesian audio message exactly. Output only the transcription, nothing else.",
      audioPart
    ]);

    return result.response.text().trim();
  } catch (error) {
    console.error('Voice transcription error:', error.message);
    return null;
  }
}

module.exports = { transcribeVoiceNote };

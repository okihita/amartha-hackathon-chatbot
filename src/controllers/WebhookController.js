const { getGeminiResponse } = require('../chatbot/aiEngine');
const { sendMessage } = require('../chatbot/whatsapp');
const { analyzeImage } = require('../chatbot/imageAnalyzer');

class WebhookController {
  async verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.MY_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  async handleMessage(req, res) {
    const body = req.body;
    
    if (!body.object) {
      return res.sendStatus(404);
    }

    const changes = body.entry?.[0]?.changes?.[0]?.value;
    const message = changes?.messages?.[0];
    
    if (!message) {
      return res.sendStatus(200);
    }

    const senderPhone = message.from;

    try {
      switch (message.type) {
        case 'text':
          await this.handleTextMessage(message, senderPhone);
          break;
        case 'image':
          await this.handleImageMessage(message, senderPhone);
          break;
        case 'audio':
        case 'voice':
          await this.handleUnsupportedMessage(senderPhone, 'audio');
          break;
        default:
          await this.handleUnsupportedMessage(senderPhone, message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }

    res.sendStatus(200);
  }

  async handleTextMessage(message, senderPhone) {
    const incomingText = message.text.body;
    console.log(`📝 Received from ${senderPhone}: ${incomingText}`);
    
    const aiReply = await getGeminiResponse(incomingText, senderPhone);
    await sendMessage(senderPhone, aiReply);
  }

  async handleImageMessage(message, senderPhone) {
    console.log(`📷 Image received from ${senderPhone}`);
    
    const imageId = message.image.id;
    const caption = message.image.caption || '';
    const aiReply = await analyzeImage(imageId, caption, senderPhone);
    
    await sendMessage(senderPhone, aiReply);
  }

  async handleUnsupportedMessage(senderPhone, type) {
    console.log(`📎 ${type} received from ${senderPhone} (not supported)`);
    
    const message = type === 'audio' 
      ? "Maaf Bu, saat ini saya belum bisa memproses pesan suara. Silakan kirim pesan teks untuk pertanyaan Ibu. 😊"
      : "Maaf Bu, saya hanya bisa memproses pesan teks. Silakan kirim pertanyaan Ibu dalam bentuk teks. 😊";
    
    await sendMessage(senderPhone, message);
  }
}

module.exports = new WebhookController();

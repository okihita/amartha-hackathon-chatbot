const { getGeminiResponse } = require('../chatbot/aiEngine');
const { sendMessage } = require('../chatbot/whatsapp');
const { analyzeImage } = require('../chatbot/imageAnalyzer');

class WebhookController {
  verify(req, res) {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    res.status(mode === 'subscribe' && token === process.env.MY_VERIFY_TOKEN ? 200 : 403).send(challenge || '');
  }

  async handleMessage(req, res) {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const phone = message.from;
    const handlers = {
      text: async () => {
        console.log(`📝 ${phone}: ${message.text.body}`);
        await sendMessage(phone, await getGeminiResponse(message.text.body, phone));
      },
      image: async () => {
        console.log(`📷 ${phone}`);
        await sendMessage(phone, await analyzeImage(message.image.id, message.image.caption || '', phone));
      },
      audio: async () => {
        console.log(`📎 ${phone} (audio)`);
        await sendMessage(phone, "Maaf Bu, saat ini saya belum bisa memproses pesan suara. Silakan kirim pesan teks. 😊");
      }
    };
    handlers.voice = handlers.audio;

    try {
      const handler = handlers[message.type] || (async () => {
        await sendMessage(phone, "Maaf Bu, saya hanya bisa memproses pesan teks. 😊");
      });
      await handler();
    } catch (error) {
      console.error(error);
    }

    res.sendStatus(200);
  }
}

module.exports = new WebhookController();

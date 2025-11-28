const { getGeminiResponse } = require('../chatbot/aiEngine');
const { sendMessage, sendQuizQuestion } = require('../chatbot/whatsapp');
const { analyzeImage } = require('../chatbot/imageAnalyzer');
const QuizService = require('../services/QuizService');

// Store pending images waiting for caption
const pendingImages = new Map();

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
        // Check if user has pending image waiting for caption
        if (pendingImages.has(phone)) {
          const imageId = pendingImages.get(phone);
          pendingImages.delete(phone);
          const caption = message.text.body;
          await sendMessage(phone, await analyzeImage(imageId, caption, phone));
        } else {
          const response = await getGeminiResponse(message.text.body, phone);
          if (response) await sendMessage(phone, response);
        }
      },
      image: async () => {
        const caption = message.image.caption || '';
        if (!caption.trim()) {
          // No caption - store image and ask for description
          pendingImages.set(phone, message.image.id);
          // Auto-expire after 5 minutes
          setTimeout(() => pendingImages.delete(phone), 5 * 60 * 1000);
          await sendMessage(phone, "📸 Gambar diterima!\n\nMohon jelaskan foto ini ya Bu. Contoh:\n• \"Ini foto warung saya\"\n• \"Stok barang dagangan\"\n• \"Catatan penjualan hari ini\"\n\nBalas dengan deskripsi agar saya bisa menganalisis dengan tepat. 😊");
        } else {
          await sendMessage(phone, await analyzeImage(message.image.id, caption, phone));
        }
      },
      audio: async () => {
        await sendMessage(phone, "Maaf Bu, saat ini saya belum bisa memproses pesan suara. Silakan kirim pesan teks. 😊");
      },
      interactive: async () => {
        await this.handleInteractiveMessage(message, phone);
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

  async handleInteractiveMessage(message, phone) {
    try {
      // Extract answer from interactive response
      const interactiveData = message.interactive;
      if (!interactiveData) return;

      let answerId;
      if (interactiveData.type === 'list_reply') {
        answerId = interactiveData.list_reply.id;
      } else if (interactiveData.type === 'button_reply') {
        answerId = interactiveData.button_reply.id;
      }

      if (!answerId || !answerId.startsWith('opt_')) {
        await sendMessage(phone, "Maaf, jawaban tidak valid.");
        return;
      }

      // Extract option index (opt_0 -> 0, opt_1 -> 1, etc)
      const answerIndex = parseInt(answerId.split('_')[1]);

      // Check answer
      const result = await QuizService.checkAnswer(phone, answerIndex);

      // Send feedback
      let feedback = result.correct 
        ? `✅ Benar!\n\n${result.explanation || ''}\n\n📊 Progress: ${result.correct_count}/${result.total_asked} benar`
        : `❌ Kurang tepat.\n\n${result.explanation || ''}\n\n📊 Progress: ${result.correct_count}/${result.total_asked} benar`;

      await sendMessage(phone, feedback);

      // Check if quiz completed
      if (result.completed) {
        const completionMsg = result.passed
          ? `🎉 Selamat! Anda lulus minggu ini dengan nilai ${result.score}!\n\nKetik "quiz" untuk lanjut ke minggu berikutnya.`
          : `📚 Nilai Anda: ${result.score}\n\nAnda perlu nilai minimal 70 untuk lulus. Ketik "quiz" untuk mengulang.`;
        
        await sendMessage(phone, completionMsg);
      } else if (result.next_question) {
        // Send next question
        await sendQuizQuestion(phone, result.next_question, result.total_asked + 1, 4);
      }
    } catch (error) {
      console.error('Error handling interactive message:', error);
      await sendMessage(phone, "Maaf, terjadi kesalahan. Ketik 'quiz' untuk memulai ulang.");
    }
  }
}

module.exports = new WebhookController();

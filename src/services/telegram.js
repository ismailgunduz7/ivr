// Telegram Bot API'sine basit bir sendMessage sarmalayıcısı (axios üzerinden)
const axios = require('axios');
const config = require('../config');

async function sendTelegramMessage(text) {
  const { botToken, chatId } = config.telegram;

  if (!botToken || !chatId) {
    console.error('[telegram] Bot token veya chat id eksik, mesaj gönderilmedi.');
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }, { timeout: 5000 });
    return true;
  } catch (err) {
    // Telegram'ın çökmesi IVR akışını bozmamalı; hatayı logla ve devam et
    console.error('[telegram] Mesaj gönderilemedi:', err.response?.data || err.message);
    return false;
  }
}

module.exports = { sendTelegramMessage };

// Ortam değişkenlerini yükle ve tek bir noktadan erişim sağla
require('dotenv').config();

const config = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  port: process.env.PORT || 3000,
  // IVR seslendirme ayarları (Türkçe)
  voice: {
    language: 'tr-TR',
    voice: 'Polly.Burcu-Neural',
  },
};

// Eksik ayarları erkenden uyar
['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Uyarı: ${key} tanımlı değil. .env dosyanızı kontrol edin.`);
  }
});

module.exports = config;

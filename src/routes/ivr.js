// IVR akışını yöneten Express rotaları
const express = require('express');
const twilio = require('twilio');
const config = require('../config');
const { sendTelegramMessage } = require('../services/telegram');

const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Ana menü metni - hem ilk girişte hem geçersiz tuşta tekrar edilecek
const MENU_TEXT =
  "Merhaba, şu an telefonlara bakamıyorum." +
  "Borç isteyecekseniz 1'i," +
  "hal hatır soracaksanız 2'yi," +
  "proje fikriniz için uygulama geliştirmemi isteyecekseniz 3'ü," +
  "halı sahaya adam lazımsa 4'ü," +
  "fizik sorunuz varsa 5'i," +
  "sıkıldıysanız 6'yı," +
  "tekrar dinlemek için yıldızı tuşlayın.";

// Menüyü <Gather> içinde okuyan yardımcı: tuşlama olmazsa otomatik tekrar eder
function buildMenu(twiml) {
  const gather = twiml.gather({
    numDigits: 1,
    action: '/gather-result',
    method: 'POST',
    timeout: 6,
    language: config.voice.language,
  });

  gather.say(
    { voice: config.voice.voice, language: config.voice.language },
    MENU_TEXT
  );

  // Eğer kullanıcı tuşlamadıysa Twilio Gather'ı atlar ve buradan devam eder.
  // /incoming-call'a tekrar yönlendirerek menüyü baştan okutuyoruz (arama düşmesin).
  twiml.redirect({ method: 'POST' }, '/incoming-call');
}

// 1) Arama ilk geldiğinde: menüyü oku, tuşlamayı bekle
router.post('/incoming-call', (req, res) => {
  const twiml = new VoiceResponse();
  buildMenu(twiml);
  res.type('text/xml').send(twiml.toString());
});

// 2) Kullanıcı tuşladığında: bildirim at, esprili kapanış yap
router.post('/gather-result', async (req, res) => {
  const digit = req.body.Digits;
  const from = req.body.From || 'Bilinmeyen numara';

  const twiml = new VoiceResponse();
  const voiceOpts = { voice: config.voice.voice, language: config.voice.language };

  // Tuşa göre bildirim metni ve kapanış cümlesi
  const handlers = {
    '1': {
      telegram: `🚨 <b>DİKKAT!</b> ${from} senden borç istemek için arıyor!`,
      hangup: "Kendisinin şu an hiç parası yokmuş, iyi günler dileriz.",
    },
    '2': {
      telegram: `👋 ${from} hal hatır sormak için aradı.`,
      hangup: "Selamınız iletildi, kendisi de size selam ediyor. Hoşça kalın.",
    },
    '3': {
      telegram: `💻 ${from} yeni bir uygulama fikriyle geliyor, dikkatli ol.`,
      hangup: "Fikriniz kaydedildi, müsait olunca dönüş yapacağız. Bol şanslar.",
    },
    '4': {
      telegram: `⚽️ ${from} halı sahaya adam arıyor çok acil.`,
      hangup: "Kramponlarını temizleyip size dönüş yapacağız. Halı sahada size iyi eğlenceler!",
    },
    '5': {
      telegram: `🔍 ${from} fizik sorusu var, Yakup'a yönlendirildi.`,
      hangup: "O zaman Yakup'u arasanıza ben ne alaka? İyi günler.",
    },
    '6': {
      telegram: `😴 ${from} sıkıldı, telefon suratına kapatıldı.`,
      hangup: "Aradığınız kişiye şu anda ulaşılamamaktadır. Lütfen daha sonra tekrar denemeyin.",
    },
  };

  const handler = handlers[digit];

  if (digit === '*') {
    buildMenu(twiml);
    return res.type('text/xml').send(twiml.toString());
  }

  // Geçersiz tuş: menüyü baştan oku
  if (!handler) {
    twiml.say(voiceOpts, "Geçersiz bir tuşa bastınız.");
    buildMenu(twiml);
    return res.type('text/xml').send(twiml.toString());
  }

  // Telegram bildirimini gönder - hata olsa bile akış devam etsin
  try {
    await sendTelegramMessage(handler.telegram);
  } catch (err) {
    console.error('[ivr] Telegram bildirimi başarısız:', err.message);
  }

  // Esprili kapanış anonsu + çağrıyı sonlandır
  twiml.say(voiceOpts, handler.hangup);
  twiml.hangup();

  res.type('text/xml').send(twiml.toString());
});

module.exports = router;

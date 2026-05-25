// IVR uygulamasının giriş noktası
const express = require('express');
const config = require('./config');
const ivrRoutes = require('./routes/ivr');

const app = express();

// Twilio webhook'ları application/x-www-form-urlencoded gönderir
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Basit sağlık kontrolü
app.get('/', (_req, res) => res.send('IVR ayakta 🎙️'));

// IVR rotaları (/incoming-call, /gather-result)
app.use('/', ivrRoutes);

// Genel hata yakalayıcı - bir endpoint patlarsa Twilio'ya geçerli TwiML dönelim
app.use((err, _req, res, _next) => {
  console.error('[server] Beklenmeyen hata:', err);
  res
    .status(500)
    .type('text/xml')
    .send('<Response><Say language="tr-TR">Bir hata oluştu, lütfen daha sonra tekrar deneyin.</Say><Hangup/></Response>');
});

app.listen(config.port, () => {
  console.log(`IVR sunucusu http://localhost:${config.port} adresinde çalışıyor`);
});

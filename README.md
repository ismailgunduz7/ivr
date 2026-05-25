# Kişisel Eğlenceli IVR

Twilio Voice + Telegram Bot API ile çalışan, gelen aramaları menüye yönlendirip Telegram'a bildirim atan mini IVR.

## Yapı

```
src/
  server.js           # Express giriş noktası
  config.js           # .env okuma
  routes/ivr.js       # /incoming-call ve /gather-result
  services/telegram.js# Telegram sendMessage sarmalayıcısı
.env.example
```

## Kurulum

```bash
npm install
cp .env.example .env   # değerleri doldur
npm start              # veya: npm run dev
```

## Twilio webhook ayarı

Twilio numaranızın **Voice → A Call Comes In** alanını şu URL'e ayarlayın:

```
POST https://<public-url>/incoming-call
```

Lokalde test için [ngrok](https://ngrok.com) kullanın:

```bash
ngrok http 3000
```

Çıkan `https://...ngrok-free.app/incoming-call` adresini Twilio'ya yapıştırın.

## Akış

1. Arama gelir → `/incoming-call` menüyü okur (Türkçe Polly).
2. Kullanıcı 1/2/3 tuşlar → `/gather-result`'a gider.
3. Tuşa göre Telegram bildirimi gönderilir.
4. Esprili kapanış anonsu çalınır ve çağrı kapanır.
5. Tuşlama yapılmazsa menü tekrar okunur (arama düşmez).

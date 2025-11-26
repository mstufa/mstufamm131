const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); // مكتبة لجلب البيانات من الروابط

// 1. ضع التوكن الخاص بك هنا
const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, {polling: true});

// --- كود السيرفر (لإبقاء البوت شغال 24 ساعة) ---
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Bot is Alive! 🟢');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// --- القائمة الرئيسية (الأزرار) ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔍 فحص IP', callback_data: 'ip_tool' },
          { text: '🆔 كشف الآيدي', callback_data: 'id_tool' }
        ],
        [
          { text: '👨‍💻 المطور', url: 'https://t.me/YOUR_USER' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, '👋 *أهلاً بك في بوت الأدوات (JS Edition)*\n\nاختر أداة من الأسفل:', { parse_mode: 'Markdown', ...opts });
});

// --- برمجة الأزرار ---
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  // أداة كشف الآيدي
  if (data === 'id_tool') {
    bot.sendMessage(chatId, `🆔 الآيدي الخاص بك هو: \`${callbackQuery.from.id}\``, { parse_mode: 'Markdown' });
  }

  // أداة فحص IP (تطلب من المستخدم إرسال IP)
  if (data === 'ip_tool') {
    bot.sendMessage(chatId, 'ارسل الـ IP أو الرابط الذي تريد فحصه الآن:');
    
    // انتظار الرد القادم (Listener)
    bot.once('message', async (msg) => {
      if (msg.text.includes('.')) { // تحقق بسيط
        bot.sendMessage(chatId, '⏳ جاري الفحص...');
        try {
          // جلب المعلومات من API
          const response = await axios.get(`http://ip-api.com/json/${msg.text}`);
          const info = response.data;
          
          if (info.status === 'success') {
            const report = `
✅ *تم الفحص بنجاح*

🌍 الدولة: ${info.country}
🏙 المدينة: ${info.city}
📡 الشبكة: ${info.isp}
📍 الاحداثيات: ${info.lat}, ${info.lon}
            `;
            bot.sendMessage(chatId, report, { parse_mode: 'Markdown' });
          } else {
            bot.sendMessage(chatId, '❌ الـ IP غير صحيح.');
          }
        } catch (error) {
          bot.sendMessage(chatId, 'حدث خطأ في الاتصال بالسيرفر.');
        }
      }
    });
  }
});

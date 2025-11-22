const { Telegraf } = require('telegraf');
const http = require('http'); // مكتبة لعمل سيرفر وهمي

// 🔴🔴 ضع مفاتيحك هنا بدقة 🔴🔴
const BOT_TOKEN = '8385456969:AAHCKiGu-J3ts5ihKtHwsP0UdN9b79R2jJY';
const GEMINI_API_KEY = 'AIzaSyBHy7Q4xHz310zjSP7u7V0VZoDo8J86mxA';

// 🎭 شخصية البوت (الهاكر العراقي)
const PERSONA = `
أنت خبير أمن سيبراني ومبرمج محترف (Hacker) من العراق.
تتحدث باللهجة العراقية الدارجة.
أسلوبك ذكي، غامض، وتستخدم مصطلحات تقنية (Server, Exploit, Bug).
تستخدم الإيموجيز: 💻, 💀, 🛡️.
`;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('تم الاتصال بالسيرفر السحابي.. البوت يعمل 24/7 ☁️💀');
});

bot.on('text', async (ctx) => {
    try {
        ctx.sendChatAction('typing');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: PERSONA + "\n\nالمستخدم: " + ctx.message.text }] 
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            await ctx.reply(data.candidates[0].content.parts[0].text);
        } else {
            console.log('No response');
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

// ⚡️ خدعة السيرفر: نفتح بورت وهمي عشان Render ما يطفي البوت
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is alive!');
});
server.listen(process.env.PORT || 3000);

// تشغيل البوت
bot.launch();
console.log('Cloud Bot Started...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

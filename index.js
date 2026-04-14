const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('8481653906:AAFzEoTDPp8w_dvwkF1GlGHHthxzMBEw8iQ');
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaB2ZLPAITb2h3PHAohji6vK9VujSPekBfxIAWb4ecXVNIp46lHt-jGxKkW8pTTU0M/exec';

console.log('🚀 البوت بيشتغل...');

bot.start(async (ctx) => {
    try {
        const response = await axios.get(SCRIPT_URL, { maxRedirects: 5 });
        const items = response.data;
        const buttons = items.map(item => [
            Markup.button.callback(`📁 ${item.name}`, `folder_${item.name}`)
        ]);
        ctx.reply('🎓 اختار القسم:', Markup.inlineKeyboard(buttons));
    } catch (e) {
        ctx.reply('⚠️ مشكلة في الاتصال بالدرايف.');
        console.log(e.message);
    }
});

bot.on('callback_query', async (ctx) => {
    const folderName = ctx.callbackQuery.data.replace('folder_', '');
    try {
        const response = await axios.get(SCRIPT_URL, { 
            params: { name: folderName }, 
            maxRedirects: 5 
        });
        const files = response.data;
        if (files.length === 0) {
            ctx.reply('📂 الفولدر فاضي.');
            return;
        }
        let msg = `📂 ملفات (${folderName}):\n\n`;
        files.forEach(f => msg += `📄 ${f.name}\n🔗 ${f.url}\n\n`);
        ctx.reply(msg);
    } catch (e) {
        ctx.reply('❌ مشكلة في جلب الملفات.');
        console.log(e.message);
    }
});

bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('✅ البوت شغال!'))
    .catch(err => console.error('❌ عطل:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
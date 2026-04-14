const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('8481653906:AAFzEoTDPp8w_dvwkF1GlGHHthxzMBEw8iQ');
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaB2ZLPAITb2h3PHAohji6vK9VujSPekBfxIAWb4ecXVNIp46lHt-jGxKkW8pTTU0M/exec';

console.log('🚀 البوت بيشتغل...');

async function getItems(folderId = '') {
    const params = folderId ? { id: folderId } : {};
    const response = await axios.get(SCRIPT_URL, { params, maxRedirects: 5 });
    return response.data;
}

bot.start(async (ctx) => {
    try {
        const items = await getItems();
        const buttons = items.map(item => [
            Markup.button.callback(
                item.type === 'folder' ? `📁 ${item.name}` : `📄 ${item.name}`,
                item.type === 'folder' ? `f_${item.id}` : `file_${item.url}`
            )
        ]);
        ctx.reply('🎓 اختار:', Markup.inlineKeyboard(buttons));
    } catch (e) {
        ctx.reply('⚠️ مشكلة في الاتصال بالدرايف.');
        console.log(e.message);
    }
});

bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('f_')) {
        const folderId = data.replace('f_', '');
        try {
            const items = await getItems(folderId);
            if (items.length === 0) {
                ctx.reply('📂 الفولدر فاضي.');
                return;
            }
            const buttons = items.map(item => [
                Markup.button.callback(
                    item.type === 'folder' ? `📁 ${item.name}` : `📄 ${item.name}`,
                    item.type === 'folder' ? `f_${item.id}` : `link_${item.url}`
                )
            ]);
            ctx.reply('📂 اختار:', Markup.inlineKeyboard(buttons));
        } catch (e) {
            ctx.reply('❌ مشكلة.');
            console.log(e.message);
        }
    }

    if (data.startsWith('link_')) {
        const url = data.replace('link_', '');
        ctx.reply(`🔗 ${url}`);
    }
});

bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('✅ البوت شغال!'))
    .catch(err => console.error('❌ عطل:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
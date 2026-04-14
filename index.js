const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('8481653906:AAFzEoTDPp8w_dvwkF1GlGHHthxzMBEw8iQ');
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaB2ZLPAITb2h3PHAohji6vK9VujSPekBfxIAWb4ecXVNIp46lHt-jGxKkW8pTTU0M/exec';

async function getItems(folderId) {
    const params = folderId ? { id: folderId } : {};
    const response = await axios.get(SCRIPT_URL, { params, maxRedirects: 5 });
    return response.data;
}

async function showFolder(ctx, folderId) {
    const items = await getItems(folderId);
    if (items.length === 0) {
        ctx.reply('📂 الفولدر فاضي.');
        return;
    }
    const folders = items.filter(i => i.type === 'folder');
    const files = items.filter(i => i.type === 'file');

    if (folders.length > 0) {
        const buttons = folders.map(f => [
            Markup.button.callback(`📁 ${f.name}`, `f_${f.id}`)
        ]);
        await ctx.reply('📂 اختار:', Markup.inlineKeyboard(buttons));
    }

    if (files.length > 0) {
        let msg = '📄 الملفات:\n\n';
        files.forEach(f => msg += `📄 ${f.name}\n🔗 ${f.url}\n\n`);
        await ctx.reply(msg);
    }
}

bot.start(async (ctx) => {
    try {
        await showFolder(ctx, null);
    } catch (e) {
        ctx.reply('⚠️ مشكلة في الاتصال.');
        console.log(e.message);
    }
});

bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('f_')) {
        const folderId = data.replace('f_', '');
        try {
            await showFolder(ctx, folderId);
        } catch (e) {
            ctx.reply('❌ مشكلة.');
            console.log(e.message);
        }
    }
    await ctx.answerCbQuery();
});

bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('✅ البوت شغال!'))
    .catch(err => console.error('❌ عطل:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
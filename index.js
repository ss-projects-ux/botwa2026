const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

// ======================
// CONFIG AMAN BOT
// ======================
let botActive = true;

// isi chat ID yang diizinkan (WAJIB kamu isi)
const SAFE_CHATS = [
    "6285133969908@c.us",   // admin
];

// ======================
// QR LOGIN
// ======================
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR WhatsApp');
});

client.on('ready', () => {
    console.log('🤖 BOT MALAM AKTIF');
});

// ======================
// UTIL
// ======================
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ======================
// JAM (TIME)
// ======================
function getTime() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ======================
// MATEMATIKA AMAN
// ======================
function calcMath(expression) {
    try {
        // safety filter (biar gak bisa injeksi aneh-aneh)
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            return "input matematika tidak valid";
        }
        return eval(expression).toString();
    } catch {
        return "error hitung";
    }
}

// ======================
// AI SANTAI
// ======================
function smartReply(text) {
    const t = text.toLowerCase();

    if (t.includes('selamat pagi')) {
        return pick(["pagi. dunia masih sama aja", "pagi juga", "pagi. jalanin aja"]);
    }

    if (t.includes('selamat malam')) {
        return pick(["malam. jangan overthinking", "malam juga", "malam. tenang dikit"]);
    }

    if (t.includes('apa kabar')) {
        return pick(["stabil", "baik", "normal versi chaos"]);
    }

    if (t.includes('capek') || t.includes('sedih')) {
        return pick(["istirahat dulu", "capek itu valid", "gak harus kuat terus"]);
    }

    return pick([
        "aku nangkep tapi agak blur",
        "oke lanjut",
        "menarik walau gak penting",
        "aku dengerin"
    ]);
}

// ======================
// MESSAGE HANDLER
// ======================
client.on('message', async msg => {
    const text = msg.body.toLowerCase();
    const chat = await msg.getChat();

    // ======================
    // GLOBAL SAFETY SWITCH
    // ======================
    if (!botActive) return;

    // whitelist chat
    if (!SAFE_CHATS.includes(msg.from)) return;

    // ======================
    // ON / OFF BOT
    // ======================
    if (text === '/offbot') {
        botActive = false;
        return msg.reply('bot dimatikan 📴');
    }

    if (text === '/onbot') {
        botActive = true;
        return msg.reply('bot diaktifkan 🟢');
    }

    // ======================
    // START MENU
    // ======================
    if (text === '/start') {
        return msg.reply(`
🤖 BOT MALAM

MENU:
/ai <pesan>
/ping
/quote
/id
/jam
/math <angka>
/help

FITUR:
- AI santai
- kalkulator
- jam realtime
- safe mode grup
        `);
    }

    // ======================
    // HELP
    // ======================
    if (text === '/help') {
        return msg.reply(`
COMMAND:
/ai halo
/ping
/quote
/id
/jam
/math 2+2
        `);
    }

    // ======================
    // PING
    // ======================
    if (text === '/ping') {
        return msg.reply('pong 🟢');
    }

    // ======================
    // ID
    // ======================
    if (text === '/id') {
        return msg.reply(`ID: ${msg.from}`);
    }

    // ======================
    // JAM
    // ======================
    if (text === '/jam') {
        return msg.reply(`🕒 ${getTime()}`);
    }

    // ======================
    // MATEMATIKA
    // ======================
    if (text.startsWith('/math')) {
        const expr = msg.body.slice(5).trim();
        if (!expr) return msg.reply('contoh: /math 2+2');
        return msg.reply(`hasil: ${calcMath(expr)}`);
    }

    // ======================
    // QUOTE
    // ======================
    if (text === '/quote') {
        const quotes = [
            "Diam itu strategi",
            "Jangan percaya kata orang",
            "Malam paling jujur"
        ];
        return msg.reply(pick(quotes));
    }

    // ======================
    // AI CHAT
    // ======================
    if (text.startsWith('/ai')) {
        const query = msg.body.slice(3).trim();
        if (!query) return msg.reply('tulis setelah /ai');
        return msg.reply(smartReply(query));
    }

    // ======================
    // AUTO HUMAN FALLBACK
    // ======================
    msg.reply(smartReply(text));
});

client.initialize();

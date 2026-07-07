/* eslint-disable no-undef */
// ==========================================
// 1. INLINE CONFIGURATION (NO .ENV REQUIRED)
// ==========================================
const APP_SECRET = 'Dhyey@123';
const DISCORD_CLIENT_ID = '1494980898041368596';
const DISCORD_CLIENT_SECRET = 'qvAr99wAQrL2Y3Yp-qpuSFJegV9_kWlO';
const DISCORD_REDIRECT_URI = 'https://steam-dx4q.onrender.com/auth/callback';
const VERCEL_FRONTEND_URL = 'https://hat manifets-store.vercel.app';
const DATABASE_URL = 'mongodb+srv://sakariyavijay10868_db_user:sBmsKHrKPw5kabWv@steambot.koco5f1.mongodb.net/?appName=SteamBot';
const GITHUB_TOKEN = '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';
const GOOGLE_CLIENT_ID = '961801559408-sojomqr6sbgu03fg7arju6tuv4m09uln.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_FOLDER_ID = '1T7M6zM1wyxzyfrTO6oJMIaMPn66u_sHm';
const GOOGLE_REFRESH_TOKEN = '1//041lrXs-z51ZCCgYIARAAGAQSNgF-L9Ir94sY6elk84oJbIwLOR7sJssb_AixPD8MA6MGGoaShyMfDYH7X_xIffNVmmVux59BHw';

const BOT_TOKEN = process.env.TOKEN || 'MTUxODY0NjAzMDQ0MTExOTgxNA.GPPnCt.kirBMwrR-O9SsJFPxWAckkhWgOyBn50xat-lxA'; 
const express = require('express');
const cors = require('cors');
const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, 
    PermissionsBitField, StringSelectMenuBuilder, AttachmentBuilder, Partials
} = require('discord.js');
const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const { setupSecurity } = require('./securityCommands');
require('dotenv').config();

const app = express(); 
app.use(express.json()); 
app.use(cors({ 
    origin: '*', 
    credentials: true 
}));
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Web server successfully bound to port ${port}`);
});

process.on('unhandledRejection', error => { console.error('⚠️ Unhandled promise rejection:', error); });
process.on('uncaughtException', error => { console.error('⚠️ Uncaught exception:', error); });

const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message] 
});
client.on('error', error => { console.error('⚠️ Discord Client Error:', error); });

const ALLOWED_GUILD_ID = '1496378683475099648';
const ELITE_ROLE_ID = '1498218542053724230'; 
const ELITE_GRANT_ROLE_ID = '1496378683575898217'; 
const OWNER_COMMAND_ROLE_ID = '1496378683575898217';

const COMMAND_CHANNEL_ID = '1518267565728595968'; 
const FIXES_CHANNEL_ID = '1518267565728595968'; 
const REQUEST_GAME_CHANNEL_ID = '1518267565728595968'; 

const CENTRAL_REQUEST_CHANNEL_ID = '1496378686654648369';
const APP_REQUEST_CHANNEL_ID = '1495408895102025789';

const NOTIFICATION_CHANNEL_ID = '1496378686977478753'; 
const TICKET_CATEGORY_ID = '149637867405293571'; // Fixed string literal boundary character from source
const DM_LOG_CHANNEL_ID = '1501962777965891594';

const DROPS_PUBLIC_CHANNEL_ID = '1495408868103290920';
const DROPS_EXCLUSIVE_CHANNEL_ID = '1495408844338364567';
const DROPS_EXCLUSIVE_ROLE_IDS = ['1478451506217750619', '1511409564296286329', '1501625256949972992'];

const FIXES_PUBLIC_FORUM_ID = '1508773633311379528';
const FIXES_EXCLUSIVE_FORUM_ID = '1508776947063193620';

const GAME_ADDER_ROLE_ID = '1496378683475099657';
const SUPPORT_ROLES = ['1518266664012087378'];
const BOT_OWNERS = ['814589753613221899', ''];
const BROKEN_REPORT_CHANNEL_ID = NOTIFICATION_CHANNEL_ID;

const { handleSecurityCommand, runAutomod } = setupSecurity(client, {
    botOwners: BOT_OWNERS,
    allowedGuildId: ALLOWED_GUILD_ID
});

// ──────────────────────────────────────────────────────────────────

// 4. Your existing database connection and bot login at the very bottom
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'));

client.login(process.env.TOKEN);

const checkStaffAuth = (interaction) => {
    if (BOT_OWNERS.includes(interaction.user.id)) return true;
    if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return true;
    const roles = interaction.member?.roles;
    if (roles?.cache?.has?.(GAME_ADDER_ROLE_ID)) return true;
    if (Array.isArray(roles) && roles.includes(GAME_ADDER_ROLE_ID)) return true;
    return false;
};

const checkSupportAuth = (interaction) => {
    if (BOT_OWNERS.includes(interaction.user.id)) return true;
    if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return true;
    const roles = interaction.member?.roles;
    if (roles?.cache) return SUPPORT_ROLES.some(r => roles.cache.has(r));
    if (Array.isArray(roles)) return SUPPORT_ROLES.some(r => roles.includes(r));
    return false;
};

const deletionTimers = new Map();

mongoose.set('strictQuery', false);
mongoose.connect(DATABASE_URL)
    .then(() => console.log('🍃 MongoDB Connected Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const Game = mongoose.model('Game', new mongoose.Schema({
    appId: { type: String, unique: true, required: true },
    name: String, description: String, image: String,
    githubPath: String, fileId: String, fileUrl: String, addedBy: String,
    fixGithubPath: String, fixId: String, fixUrl: String, fixAddedBy: String,
    tags: { type: [String], default: [] },
    genre: { type: String, default: '' },
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true }));

const GameFix = mongoose.model('GameFix', new mongoose.Schema({
    appId: { type: String, required: true, index: true },
    name: String, description: String, image: String,
    githubPath: String, fileId: String, addedBy: String,
    version: { type: String, default: '1.0' },
    notes: String
}, { timestamps: true }));

const TicketConfig = mongoose.model('TicketConfig', new mongoose.Schema({ count: { type: Number, default: 0 } }));
const BotConfig = mongoose.model('BotConfig', new mongoose.Schema({ limitEnabled: { type: Boolean, default: false } }));
const UserLimit = mongoose.model('UserLimit', new mongoose.Schema({ userId: { type: String, unique: true, required: true }, uses: { type: [Number], default: [] } }));
const EliteSub = mongoose.model('EliteSub', new mongoose.Schema({ userId: { type: String, unique: true, required: true }, expiresAt: Number }));
const RequestTracker = mongoose.model('RequestTracker', new mongoose.Schema({ 
    appId: { type: String, unique: true, required: true }, 
    requesterId: String,
    username: String,
    gameName: String,
    bannerUrl: String,
    source: { type: String, default: 'discord' },
    status: { type: String, default: 'pending' },
    type: String 
}, { timestamps: true }));

const BrokenReport = mongoose.model('BrokenReport', new mongoose.Schema({
    appId: { type: String, required: true },
    reportedBy: { type: String, required: true },
    reason: String,
    status: { type: String, default: 'pending' },
    resolvedBy: String
}, { timestamps: true }));

const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
    action: { type: String, required: true },
    appId: String,
    gameName: String,
    userId: { type: String, required: true },
    userName: String,
    details: String
}, { timestamps: true }));

const UserFavorite = mongoose.model('UserFavorite', new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    gameIds: { type: [String], default: [] }
}));

setInterval(async () => {
    try {
        const expired = await EliteSub.find({ expiresAt: { $lte: Date.now() } });
        for (const sub of expired) {
            const guild = client.guilds.cache.get(ALLOWED_GUILD_ID);
            if (guild) { try { const member = await guild.members.fetch(sub.userId); if (member) await member.roles.remove(ELITE_ROLE_ID); } catch (e) {} }
            await EliteSub.deleteOne({ userId: sub.userId });
        }
    } catch (err) {}
}, 60000); 

async function getSteam(appId) {
    try { 
        const res = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`); 
        const d = res.data[appId]; 
        if (!d || !d.success) return null; 
        return { name: d.data.name, description: d.data.short_description, image: d.data.header_image }; 
    } catch { return null; }
}

async function checkAvailability(appId, isFix) {
    const g = await Game.findOne({ appId: appId });
    if (g) {
        if (isFix && (g.fixGithubPath || g.fixId || g.fixUrl)) return true;
        if (!isFix && (g.githubPath || g.fileId || g.fileUrl)) return true;
    }

    const baseUrl = 'https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/';
    const urls = isFix 
        ? [`${baseUrl}${appId}_fix.lua`, `${baseUrl}${appId}_fix.zip`]
        : [`${baseUrl}${appId}.lua`, `${baseUrl}${appId}.zip`];
    
    for (const url of urls) {
        try {
            const res = await axios.head(url, { timeout: 3000 });
            if (res.status === 200) return true;
        } catch (e) {}
    }

    if (!isFix) {
        const ryuuKey = process.env.RYUU_API_KEY || 'RYUUMANIFEST9t6auh';
        const ryuuLuaKey = process.env.RYUU_LUA_API_KEY || 'MANIFEST9t6auh';

        try {
            const mRes = await axios.get(`https://generator.ryuu.lol/secure_download?appid=${appId}&auth_code=${ryuuKey}`, { responseType: 'arraybuffer', timeout: 5000 });
            if (mRes.status === 200 && mRes.data.length > 50) return true;
        } catch (e) {}

        try {
            const lRes = await axios.get(`https://generator.ryuu.lol/resellerlua?appid=${appId}&auth_code=${ryuuLuaKey}`, { responseType: 'arraybuffer', timeout: 5000 });
            if (lRes.status === 200 && lRes.data.length > 50) return true;
        } catch (e) {}
    }

    return false;
}

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "https://developers.google.com/oauthplayground");
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function uploadToGitHub(fileUrl, fileName) {
    try {
        const res = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        if (res.data.length / (1024 * 1024) > 25) return null;
        await axios.put(`https://api.github.com/repos/steamtoolsbot-dhyey/filebase/contents/${fileName}`, { 
            message: `Auto-upload: ${fileName}`, 
            content: Buffer.from(res.data).toString('base64') 
        }, { 
            headers: { 
                'Authorization': `Bearer ${GITHUB_TOKEN}`, 
                'Accept': 'application/vnd.github.v3+json', 
                'User-Agent': 'HatManifetsManifests' 
            }, 
            maxBodyLength: Infinity, maxContentLength: Infinity 
        });
        return fileName; 
    } catch (err) { return err.response?.status === 422 ? fileName : null; }
}

async function uploadToDrive(fileUrl, fileName) {
    try {
        const res = await axios.get(fileUrl, { responseType: 'stream', maxContentLength: Infinity, maxBodyLength: Infinity });
        const driveRes = await drive.files.create({ resource: { name: fileName, parents: [GOOGLE_FOLDER_ID] }, media: { mimeType: 'application/octet-stream', body: res.data }, fields: 'id' });
        await drive.permissions.create({ fileId: driveRes.data.id, requestBody: { role: 'reader', type: 'anyone' } });
        return driveRes.data.id; 
    } catch { return null; }
}

async function transferDriveToGitHub(driveFileId, fileName) {
    try {
        const fileMetadata = await drive.files.get({ fileId: driveFileId, fields: 'size' });
        const sizeBytes = parseInt(fileMetadata.data.size, 10);
        if (isNaN(sizeBytes) || sizeBytes / (1024 * 1024) > 25) return null; 

        const driveRes = await drive.files.get({ fileId: driveFileId, alt: 'media' }, { responseType: 'arraybuffer' });
        await axios.put(`https://api.github.com/repos/steamtoolsbot-dhyey/filebase/contents/${fileName}`, { 
            message: `Auto-Sync from Drive: ${fileName}`, 
            content: Buffer.from(driveRes.data).toString('base64') 
        }, { 
            headers: { 
                'Authorization': `Bearer ${GITHUB_TOKEN}`, 
                'Accept': 'application/vnd.github.v3+json', 
                'User-Agent': 'HatManifetsManifests' 
            }, 
            maxBodyLength: Infinity, maxContentLength: Infinity 
        });
        return fileName;
    } catch (err) { return err.response?.status === 422 ? fileName : (err.response?.status === 403 ? 'ERROR_403' : null); }
}

async function sendNotification(steamData, isFix, userId, appId, requesterId = null) {
    try {
        const channel = await client.channels.fetch(NOTIFICATION_CHANNEL_ID); 
        if (!channel || !steamData) return;
        let creditText = `**Added by:** <@${userId}>`;
        if (requesterId) creditText += ` on the request of <@${requesterId}>`;
        creditText += `\n\n${steamData.description || '*No description provided.*'}`;
        const embed = new EmbedBuilder().setTitle(`${isFix ? '🔧 New Fix Added' : '🎉 New Game Added'}: ${steamData.name}`).setDescription(creditText).setColor('#FFD700').setFooter({ text: `App ID: ${appId} • Use /gen in the bot channel to download!` });
        if (steamData.image) embed.setImage(steamData.image); 
        await channel.send({ embeds: [embed], flags: [4096] });
    } catch (err) {}
}

async function checkRateLimit(userId, isElite) {
    let config = await BotConfig.findOne();
    if (!config || !config.limitEnabled) return { blocked: false, limitActive: false };
    if (isElite) return { blocked: false, limitActive: true, remaining: "Unlimited (Elite)" };

    const limitCount = 25; const limitHours = 24; const cutoff = Date.now() - (limitHours * 60 * 60 * 1000);
    
    let record = await UserLimit.findOne({ userId }); 
    if (!record) record = new UserLimit({ userId, uses: [] });
    
    record.uses = record.uses.filter(ts => ts > cutoff);

    if (record.uses.length >= limitCount) {
        const remainingMs = Math.min(...record.uses) + (limitHours * 60 * 60 * 1000) - Date.now();
        return { blocked: true, hours: Math.floor(remainingMs / (1000 * 60 * 60)), mins: Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)) };
    }
    
    record.uses.push(Date.now()); 
    await record.save();
    
    return { blocked: false, limitActive: true, remaining: limitCount - record.uses.length };
}

function parseTime(timeStr) {
    const match = timeStr.match(/^(\d+)([mhdwy])$/i); if (!match) return null;
    const val = parseInt(match[1]); const multipliers = { m: 60*1000, h: 60*60*1000, d: 24*60*60*1000, w: 7*24*60*60*1000, y: 365*24*60*60*1000 };
    return val * multipliers[match[2].toLowerCase()];
}

function isValidGameFile(filename) {
    return filename.endsWith('.zip') || filename.endsWith('.lua');
}

async function addAuditLog(action, appId, gameName, userId, userName, details) {
    try {
        await new AuditLog({ action, appId, gameName, userId, userName, details }).save();
    } catch (e) {}
}

async function processBrandedZipOnDisk(appId, steamName, downloadUrl, headers = {}, isLuaOnly = false) {
    const tmpBase = `/tmp/hat manifets_${appId}_${Date.now()}`;
    const dlPath = isLuaOnly ? `${tmpBase}.lua` : `${tmpBase}_dl.zip`;
    const extPath = `${tmpBase}_ext`;
    const finalPath = `${tmpBase}_final.zip`;

    try {
        const writer = fs.createWriteStream(dlPath);
        const response = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream', headers, timeout: 45000 });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });

        fs.mkdirSync(extPath, { recursive: true });

        if (isLuaOnly) {
            fs.renameSync(dlPath, path.join(extPath, `${appId}.lua`));
        } else {
            execSync(`unzip -o "${dlPath}" -d "${extPath}"`, { stdio: 'ignore' });
        }

        const files = fs.readdirSync(extPath);
        for (const file of files) {
            if (file.endsWith('.lua')) {
                const luaPath = path.join(extPath, file);
                let content = fs.readFileSync(luaPath, 'utf8');
                const cleanCode = content.replace(/^--.*$/gm, '').replace(/^\s*[\r\n]/gm, '').trim();
                const newHeader = `-- ${appId}'s Lua and Manifest Provided by HatManifets Manifests\n-- ${steamName || 'Unknown Game'}\n-- Discord server: https://discord.gg/uQfPEUdbgn\n\n`;
                fs.writeFileSync(luaPath, newHeader + cleanCode, 'utf8');
            }
        }

        execSync(`cd "${extPath}" && zip -r "${finalPath}" .`, { stdio: 'ignore' });

        return { 
            finalPath, 
            cleanup: () => {
                try {
                    if (fs.existsSync(dlPath)) fs.unlinkSync(dlPath);
                    if (fs.existsSync(extPath)) fs.rmSync(extPath, { recursive: true, force: true });
                    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
                } catch(e) {}
            }
        };
    } catch (err) {
        try {
            if (fs.existsSync(dlPath)) fs.unlinkSync(dlPath);
            if (fs.existsSync(extPath)) fs.rmSync(extPath, { recursive: true, force: true });
            if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
        } catch(e) {}
        return null;
    }
}

async function processRyuuApi(appId, steamName) {
    const ryuuKey = process.env.RYUU_API_KEY || 'RYUUMANIFEST9t6auh';
    const ryuuLuaKey = process.env.RYUU_LUA_API_KEY || 'MANIFEST9t6auh';

    const tmpBase = `/tmp/ryuu_${appId}_${Date.now()}`;
    const extPath = `${tmpBase}_ext`;
    const finalPath = `${tmpBase}_final.zip`;

    try {
        fs.mkdirSync(extPath, { recursive: true });
        let gotFiles = false;

        try {
            const manifestUrl = `https://generator.ryuu.lol/secure_download?appid=${appId}&auth_code=${ryuuKey}`;
            console.log(`🤖 Attempting RYUU Manifest fetch for App ID ${appId}...`);
            const mRes = await axios.get(manifestUrl, { responseType: 'arraybuffer', timeout: 20000 });
            
            console.log(`📡 RYUU Manifest Status: ${mRes.status}, Data Length: ${mRes.data ? mRes.data.length : 0}`);
            if (mRes.status === 200 && mRes.data.length > 50) {
                const contentType = mRes.headers['content-type'] || '';
                const disp = mRes.headers['content-disposition'] || '';
                
                if (contentType.includes('zip') || disp.includes('.zip')) {
                    const tempZip = path.join(extPath, 'temp_manifest.zip');
                    fs.writeFileSync(tempZip, mRes.data);
                    execSync(`unzip -o "${tempZip}" -d "${extPath}"`, { stdio: 'ignore' });
                    fs.unlinkSync(tempZip);
                } else {
                    fs.writeFileSync(path.join(extPath, `${appId}.manifest`), mRes.data);
                }
                gotFiles = true;
            } else if (mRes.status === 200) {
                console.log(`⚠️ RYUU returned 200 but data payload was too small (< 50 bytes): "${Buffer.from(mRes.data).toString('utf8')}"`);
            }
        } catch (e) { 
            console.error(`❌ RYUU Manifest Request Error for App ID ${appId}: ${e.response?.status || e.message}`); 
        }

        try {
            const luaUrl = `https://generator.ryuu.lol/resellerlua?appid=${appId}&auth_code=${ryuuLuaKey}`;
            console.log(`🤖 Attempting RYUU Lua fetch for App ID ${appId}...`);
            const lRes = await axios.get(luaUrl, { responseType: 'arraybuffer', timeout: 20000 });
            
            console.log(`📡 RYUU Lua Status: ${lRes.status}, Data Length: ${lRes.data ? lRes.data.length : 0}`);
            if (lRes.status === 200 && lRes.data.length > 50) {
                const luaPath = path.join(extPath, `${appId}.lua`);
                let content = Buffer.from(lRes.data).toString('utf8');
                
                const cleanCode = content.replace(/^--.*$/gm, '').replace(/^\s*[\r\n]/gm, '').trim();
                const newHeader = `-- ${appId}'s Lua and Manifest Provided by HatManifets Manifests\n-- ${steamName || 'Unknown Game'}\n-- Discord server: https://discord.gg/uQfPEUdbgn\n\n`;
                fs.writeFileSync(luaPath, newHeader + cleanCode, 'utf8');
                gotFiles = true;
            } else if (lRes.status === 200) {
                console.log(`⚠️ RYUU returned 200 but Lua payload was too small (< 50 bytes): "${Buffer.from(lRes.data).toString('utf8')}"`);
            }
        } catch (e) { 
            console.error(`❌ RYUU Lua Request Error for App ID ${appId}: ${e.response?.status || e.message}`); 
        }

        if (!gotFiles) {
            console.log(`❌ No files recovered from RYUU for App ID ${appId}. Initializing fallback pipeline...`);
            fs.rmSync(extPath, { recursive: true, force: true });
            return null;
        }

        console.log(`⚡ Packing RYUU assets into final zip package...`);
        execSync(`cd "${extPath}" && zip -r "${finalPath}" .`, { stdio: 'ignore' });

        return { 
            finalPath, 
            cleanup: () => {
                try {
                    if (fs.existsSync(extPath)) fs.rmSync(extPath, { recursive: true, force: true });
                    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
                } catch(e) {}
            }
        };
    } catch (err) {

        console.error(`❌ CRITICAL CRASH inside processRyuuApi pipeline:`, err);
        try {
            if (fs.existsSync(extPath)) fs.rmSync(extPath, { recursive: true, force: true });
            if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
        } catch(e) {}
        return null;
    }
}

// ==================================================
// NEW FUNCTION: PERONDEPOT FILE SEARCH UTILITY
// ==================================================
async function searchPeronDepot(query) {
    try {
        const response = await axios.get('https://api.perondepot.xyz/all/', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let files = [];

        // Support JSON array lists or generic JSON maps containing files strings
        if (response.data && Array.isArray(response.data)) {
            response.data.forEach(item => {
                const str = typeof item === 'string' ? item : (item.name || item.filename || item.url || '');
                if (str) files.push({ raw: encodeURIComponent(str), decoded: str });
            });
        } else if (response.data && typeof response.data === 'object') {
            const dataStr = JSON.stringify(response.data);
            const regex = /"([^"]+\.(?:rar|zip|7z|lua|exe|manifest))"/gi;
            let match;
            while ((match = regex.exec(dataStr)) !== null) {
                files.push({ raw: encodeURIComponent(match[1]), decoded: match[1] });
            }
        } else if (typeof response.data === 'string') {
            // Support Nginx / Apache standard folder directory indexes
            const regex = /href="([^"]+)"/g;
            let match;
            while ((match = regex.exec(response.data)) !== null) {
                const href = match[1];
                if (href && !href.startsWith('?') && !href.startsWith('/') && href !== '../') {
                    files.push({
                        raw: href,
                        decoded: decodeURIComponent(href)
                    });
                }
            }
        }

        if (files.length === 0) return [];

        // Split multiple search keywords to run an approximate flexible search match logic
        const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = files.filter(f => {
            const lowerDecoded = f.decoded.toLowerCase();
            return queryTerms.every(term => lowerDecoded.includes(term));
        });

        // Deduplicate elements inside matching rows array
        const uniqueMatches = [];
        const seen = new Set();
        for (const item of matches) {
            if (!seen.has(item.decoded)) {
                seen.add(item.decoded);
                uniqueMatches.push(item);
            }
        }

        return uniqueMatches.map(f => {
            let cleanName = f.decoded.replace(/%20/g, ' ').trim();
            const urlFragment = f.raw.includes('%') ? f.raw : encodeURIComponent(f.raw);
            const fullUrl = `https://api.perondepot.xyz/all/${urlFragment}`;
            return `[${cleanName}](${fullUrl})`;
        });

    } catch (error) {
        console.error('❌ Error fetching from PeronDepot server:', error.message);
        return null;
    }
}

// ==========================================
// AUTOMATIC COMMAND REGISTRATION ROUTINE
// ==========================================
async function registerOnlineFixCommand() {
    try {
        if (client.application) {
            console.log(`⚡ Automatically deploying /onlinefix command to Guild ID: ${ALLOWED_GUILD_ID}...`);
            await client.application.commands.create({
                name: 'onlinefix',
                description: 'Search for online multiplayer game fixes from PeronDepot directory listings',
                options: [
                    {
                        name: 'game_name',
                        description: 'The name or keyword of the game you want to search for',
                        type: 3, // String parameter definition type code
                        required: true
                    }
                ]
            }, ALLOWED_GUILD_ID);
            console.log(`✅ Successfully registered /onlinefix command dynamically!`);
        }
    } catch (error) {
        console.error('⚠️ Failed to automatically deploy/update onlinefix slash command execution schemas:', error);
    }
}

app.get('/', (req, res) => res.send('HatManifets Manifests Server is Online (Dynamic GitHub Vault Edition)!')); 

app.get('/auth/login', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect(`${VERCEL_FRONTEND_URL}/pages/profile.html?error=NoCode`);

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_REDIRECT_URI,
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { authorization: `Bearer ${accessToken}` }
        });
        const userData = userResponse.data;

        let isStaff = false;
        try {
            const memberResponse = await axios.get(`https://discord.com/api/users/@me/guilds/${ALLOWED_GUILD_ID}/member`, {
                headers: { authorization: `Bearer ${accessToken}` }
            });
            if (memberResponse.data.roles.includes(GAME_ADDER_ROLE_ID)) {
                isStaff = true;
            }
        } catch (err) {}

        const userPayload = encodeURIComponent(JSON.stringify({
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar,
            isStaff: isStaff
        }));
        
        res.redirect(`${VERCEL_FRONTEND_URL}/pages/profile.html#session=${userPayload}`);

    } catch (error) {
        console.error("OAuth2 Error:", error.response?.data || error.message);
        res.redirect(`${VERCEL_FRONTEND_URL}/pages/profile.html?error=AuthFailed`);
    }
});

app.get('/api/admin/requests', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
        const requests = await RequestTracker.find().sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: "Database Error" });
    }
});

app.post('/api/request-game', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized access." });
    }
    const { appId, userId, username, gameName, bannerUrl } = req.body;

    const isAvailable = await checkAvailability(appId, false);
    if (isAvailable) {
        return res.status(409).json({ error: "This game is already in the Ryuu DB or GitHub Vault! Use /gen in Discord to download." });
    }

    const existingRequest = await RequestTracker.findOne({ appId, status: 'pending' });
    if (existingRequest) return res.status(409).json({ error: "Game already has a pending request." });

    try {
        await RequestTracker.findOneAndUpdate(
            { appId: appId }, 
            { requesterId: userId, username: username, gameName: gameName, bannerUrl: bannerUrl, source: "desktop-app", status: "pending", type: 'game' }, 
            { upsert: true }
        );
        
        const embed = new EmbedBuilder()
            .setTitle(`📩 Game Request: ${gameName} (From App/Website)`)
            .setDescription(`**App ID:** \`${appId}\`\n\n*Click the button below and upload the file to fulfill this request.*`)
            .setThumbnail(bannerUrl || null)
            .setColor('#5865F2');
            
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`reqUp_game_${appId}_${userId}`)
                .setLabel('Upload File')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📤')
        );
        
        const appChannel = await client.channels.fetch(APP_REQUEST_CHANNEL_ID);
        await appChannel.send({ 
            content: `🔔 External Game Request from <@${userId}> (${username})`, 
            embeds: [embed], 
            components: [row] 
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Discord API Error" });
    }
});

app.post('/api/admin/fulfill', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) return res.status(401).json({ error: "Unauthorized" });
    const { reqId, appId, userId, githubPath, fulfilledBy } = req.body;
    try {
        const steam = await getSteam(appId);
        if (steam) {
            await Game.findOneAndUpdate(
                { appId: appId },
                { ...steam, githubPath: githubPath, addedBy: fulfilledBy },
                { upsert: true }
            );
        }
        if (reqId) await RequestTracker.deleteOne({ _id: reqId });
        
        if (userId && steam) {
            try {
                const requester = await client.users.fetch(userId);
                if (requester) {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('✅ Request Fulfilled!')
                        .setDescription(`Your request for **${steam.name}** has been uploaded to the vault!\n\nGo to <#${COMMAND_CHANNEL_ID}> and type \`/gen ${appId}\` to download it!`)
                        .setColor('#00FF00');
                    if (steam.image) dmEmbed.setImage(steam.image);
                    await requester.send({ embeds: [dmEmbed] });
                }
            } catch (e) {}
        }
        if (steam) await sendNotification(steam, false, fulfilledBy, appId, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/admin/reject', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) return res.status(401).json({ error: "Unauthorized" });
    const { reqId } = req.body;
    try {
        if (reqId) await RequestTracker.deleteOne({ _id: reqId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/drops/messages', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const channelId = req.query.channel;
    const limit = parseInt(req.query.limit) || 50;

    const allowedChannels = [DROPS_PUBLIC_CHANNEL_ID, DROPS_EXCLUSIVE_CHANNEL_ID];
    if (!allowedChannels.includes(channelId)) {
        return res.status(403).json({ error: "Channel not permitted" });
    }

    try {
        const channel = await client.channels.fetch(channelId);
        const messages = await channel.messages.fetch({ limit });
        const formatted = messages.map(m => ({
            id: m.id,
            content: m.content,
            timestamp: m.createdAt,
            author: {
                id: m.author.id,
                username: m.author.username,
                avatar: m.author.avatar,
                discriminator: m.author.discriminator
            },
            attachments: m.attachments.map(a => ({
                url: a.url,
                filename: a.name,
                size: a.size,
                content_type: a.contentType
            })),
            embeds: m.embeds.map(e => ({
                title: e.title,
                description: e.description,
                url: e.url,
                color: e.color
            }))
        }));
        res.json({ success: true, messages: Array.from(formatted.values()) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/fixes/threads', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const channelId = req.query.channel;
    const limit = parseInt(req.query.limit) || 20;

    const allowedChannels = [FIXES_PUBLIC_FORUM_ID, FIXES_EXCLUSIVE_FORUM_ID];
    if (!allowedChannels.includes(channelId)) {
        return res.status(403).json({ error: "Channel not permitted" });
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return res.status(404).json({ error: "Channel not found" });

        const active = await channel.threads.fetchActive();
        const archived = await channel.threads.fetchArchived({ limit: 20 });
        
        let threads = [...active.threads.values(), ...archived.threads.values()];
        threads.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
        threads = threads.slice(0, limit);

        const formatted = await Promise.all(threads.map(async t => {
            let starterMessage = null;
            try {
                const msg = await t.fetchStarterMessage();
                if (msg) {
                    starterMessage = {
                        content: msg.content,
                        attachments: msg.attachments.map(a => ({ url: a.url, filename: a.name, size: a.size, content_type: a.contentType })),
                        embeds: msg.embeds.map(e => ({ title: e.title, description: e.description, url: e.url, color: e.color }))
                    };
                }
            } catch (e) {}

            let authorData = { id: t.ownerId, username: 'Unknown User', avatar: null };
            try {
                const owner = await client.users.fetch(t.ownerId);
                if (owner) authorData = { id: owner.id, username: owner.username, avatar: owner.avatar };
            } catch (e) {}

            return {
                id: t.id,
                name: t.name,
                timestamp: t.createdAt,
                author: authorData,
                starterMessage
            };
        }));

        res.json({ success: true, threads: formatted });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/drops/roles', async (req, res) => {
    if (req.headers.authorization !== `Bearer ${APP_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
        const guild = await client.guilds.fetch(ALLOWED_GUILD_ID);
        const member = await guild.members.fetch(userId);
        const hasExclusive = DROPS_EXCLUSIVE_ROLE_IDS.some(r => member.roles.cache.has(r));
        res.json({ success: true, hasExclusive });
    } catch (err) {
        res.json({ success: true, hasExclusive: false });
    }
});

client.once('clientReady', async () => { 
    console.log(`🤖 HatManifets Manifests is online and locked to the GitHub Vault!`); 
    await registerOnlineFixCommand();
});

// Dual ready handler listener strategy configuration layer to guarantee launch setup safety
client.once('ready', async () => {
    await registerOnlineFixCommand();
});

client.on('messageCreate', async message => {
    if (!message.guild) {
        if (message.author.bot) return;
        const dmLogChannel = client.channels.cache.get(DM_LOG_CHANNEL_ID);
        if (dmLogChannel) {
            const embed = new EmbedBuilder().setAuthor({ name: `${message.author.tag} sent a DM`, iconURL: message.author.displayAvatarURL() }).setDescription(message.content || '*No text content*').setColor('#00f0ff').setFooter({ text: `User ID: ${message.author.id}` }).setTimestamp();
            if (message.attachments.size > 0) { embed.addFields({ name: 'Attachments', value: `Contains ${message.attachments.size} file(s)` }); }
            await dmLogChannel.send({ embeds: [embed] });
            await message.reply('✅ Your message has been securely forwarded to the HatManifets Staff.');
        }
        return; 
    }

    if (message.guildId !== ALLOWED_GUILD_ID || message.author.bot) return;

    if (await handleSecurityCommand(message)) return;
    await runAutomod(message);

    if (message.content === '!erdi' || message.content === '!steamfix' || message.content === '!gamepackfix' || message.content === '!gameremoval' || message.content === '!gameactivation' || message.content === '!reactivation') {
        return message.reply({ content: "Please run text trigger commands normally." }); 
    }

    if (message.channelId === COMMAND_CHANNEL_ID) {
        if (message.content.startsWith('/')) return; 
        const rawQuery = message.content.trim(); if (!rawQuery) return;

        const hasOverrideRole = message.member?.roles?.cache?.has('1496378683575898217');
        const isElite = message.member?.roles?.cache?.has(ELITE_ROLE_ID) || hasOverrideRole;
        
        let limitRes = await checkRateLimit(message.author.id, isElite);
        if (limitRes.blocked) {
            const reply = await message.reply(`⏳ **Daily Limit Reached!** Please wait **${limitRes.hours}h ${limitRes.mins}m**.`);
            setTimeout(() => reply.delete().catch(() => {}), 7000);
            return;
        }

        const waitMsg = await message.reply("⏳ Searching HatManifets Vault...");
        
        let appId = rawQuery;

        if (!/^\d+$/.test(rawQuery)) {
            const fallbackGame = await Game.findOne({ name: { $regex: rawQuery, $options: 'i' } });
            if (fallbackGame) {
                appId = fallbackGame.appId;
            } else {
                try {
                    const steamRes = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(rawQuery)}`);
                    if (steamRes.data && Array.isArray(steamRes.data) && steamRes.data.length > 0) {
                        appId = steamRes.data[0].appid.toString();
                    }
                } catch (e) {}
            }
        }

        if (!/^\d+$/.test(appId)) {
            return waitMsg.edit(`❌ Could not find a game matching **${rawQuery}**. Try using the exact Steam App ID or typing the full name!`);
        }

        const steamData = await getSteam(appId);
        const fallbackDesc = steamData?.description || '*No description provided by Steam.*';
        const sanitizedName = (steamData?.name || appId).replace(/[^a-zA-Z0-9]/g, '_'); 

        const embed = new EmbedBuilder().setColor('#0099ff').setTitle(steamData?.name || `App ID: ${appId}`).setFooter({ text: `App ID: ${appId}` });
        if (steamData?.image) embed.setImage(steamData.image);

        let branded = await processRyuuApi(appId, steamData?.name);
        let g = null;

        if (!branded) {
            g = await Game.findOne({ appId: appId });
            let potentialUrls = [];

            if (g && g.githubPath) {
                potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${g.githubPath}`, isLua: g.githubPath.endsWith('.lua') });
            }
            potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}.lua`, isLua: true });
            potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}.zip`, isLua: false });

            for (const target of potentialUrls) {
                branded = await processBrandedZipOnDisk(appId, steamData?.name, target.url, { 'Authorization': `token ${GITHUB_TOKEN}` }, target.isLua);
                if (branded) break;
            }
        }

        if (branded) {
            embed.setDescription(`${fallbackDesc}\n\n📥 **File attached above!**`);
            await waitMsg.edit({ content: null, embeds: [embed], files: [new AttachmentBuilder(branded.finalPath, { name: `${sanitizedName}_Vault.zip` })] });
            branded.cleanup();
            return;
        } else {
            if (!g) g = await Game.findOne({ appId: appId });
            if (g && g.fileId) {
                embed.setDescription(`${fallbackDesc}\n\n📥 **[Drive Download Link](https://drive.google.com/uc?export=download&id=${g.fileId})**`);
                return waitMsg.edit({ content: null, embeds: [embed] });
            }
        }

        return waitMsg.edit(`❌ Not found in our RYUU DB or HatManifets Vault!\n👉 **Go to <#${REQUEST_GAME_CHANNEL_ID}> to request it!**`);
    }

    if (message.channelId === REQUEST_GAME_CHANNEL_ID) {
        if (message.content.startsWith('/')) return; 
        const query = message.content.trim();
        if (!/^\d+$/.test(query)) return message.reply("❌ Please type a valid Steam App ID (Numbers Only).").then(m => setTimeout(() => m.delete(), 5000));
        
        const isAvailable = await checkAvailability(query, false);
        if (isAvailable) {
            return message.reply(`❌ **App ID ${query}** is already available in the Ryuu DB or GitHub Vault!\n👉 Just use \`/gen ${query}\` in the bot channel to download it.`);
        }

        const existingRequest = await RequestTracker.findOne({ appId: query, status: 'pending' });
        if (existingRequest) return message.reply(`❌ **App ID ${query}** already has a pending request!`);

        const steam = await getSteam(query); 
        if (!steam) return message.reply('❌ Invalid Steam App ID.');
        
        await RequestTracker.findOneAndUpdate({ appId: query }, { requesterId: message.author.id, type: 'game' }, { upsert: true });
        
        const embed = new EmbedBuilder().setTitle(`📩 Game Request: ${steam.name}`).setDescription(`**App ID:** \`${query}\`\n\n*Click the button below and upload the file to fulfill this request.*`).setThumbnail(steam.image).setColor('#5865F2');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`reqUp_game_${query}`).setLabel('Upload File').setStyle(ButtonStyle.Success).setEmoji('📤'));
        const centralChannel = await client.channels.fetch(CENTRAL_REQUEST_CHANNEL_ID); 
        await centralChannel.send({ content: `🔔 Game Request from <@${message.author.id}>`, embeds: [embed], components: [row] }); 
        return message.reply(`✅ Request sent to Game Adders! They will upload it soon.`);
    }
});

client.on('interactionCreate', async interaction => {

    if (interaction.isMessageContextMenuCommand()) {
        if (interaction.commandName === 'Vault This Post') {

            await interaction.deferReply({ ephemeral: true });
            
            const targetMsg = interaction.targetMessage;
            const destinationChannelId = '1448668445976563794'; 
            
            try {

                const destChannel = await client.channels.fetch(destinationChannelId);
                if (!destChannel) return interaction.editReply('❌ Destination channel not found!');

                let contentToPaste = `**[OG Post Grabbed]**\n**Author:** ${targetMsg.author.tag}\n\n${targetMsg.content}`;

                const attachments = targetMsg.attachments.map(a => a.url);

                await destChannel.send({
                    content: contentToPaste,
                    files: attachments
                });

                return interaction.editReply(`✅ Successfully vaulted this post to <#${destinationChannelId}>!`);
            } catch (error) {
                console.error('❌ Context Menu Error:', error);
                return interaction.editReply(`❌ Failed to forward the message.`);
            }
        }
    }

    if (interaction.isChatInputCommand() && interaction.guildId !== ALLOWED_GUILD_ID) {
        return interaction.reply({ content: '❌ Commands are locked to the official server.', ephemeral: true });
    }

    try {
        if (interaction.isAutocomplete()) {
            if (interaction.guildId !== ALLOWED_GUILD_ID) return interaction.respond([]);
            const focus = interaction.options.getFocused();
            try {
                if (!focus) {
                    const dbGames = await Game.find().sort({ createdAt: -1 }).limit(25);
                    return interaction.respond(dbGames.map(g => ({ name: `${g.name} (${g.appId})`.substring(0, 100), value: g.appId })));
                } else {
                    const steamRes = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(focus)}`);
                    const items = Array.isArray(steamRes.data) ? steamRes.data : [];
                    
                    if (items.length > 0) {
                        return interaction.respond(items.slice(0, 25).map(item => ({ name: `${item.name} (${item.appid})`.substring(0, 100), value: item.appid.toString() })));
                    } else {
                        const dbFallback = await Game.find({ $or: [ { name: new RegExp(focus, 'i') }, { appId: new RegExp(focus, 'i') } ] }).limit(25);
                        return interaction.respond(dbFallback.map(g => ({ name: `${g.name} (${g.appId})`.substring(0, 100), value: g.appId })));
                    }
                }
            } catch (err) { return interaction.respond([]); }
        }

        if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

        // ==========================================
        // ONLINEFIX INTERACTION CHAT COMMAND BLOCK
        // ==========================================
        if (interaction.commandName === 'onlinefix') {
            await interaction.deferReply();
            const gameName = interaction.options.getString('game_name');
            const results = await searchPeronDepot(gameName);

            if (results === null) {
                return interaction.editReply("❌ An error occurred while retrieving data elements from PeronDepot server instances.");
            }
            if (results.length === 0) {
                return interaction.editReply(`❌ No online multiplayer fixes found matching your query keywords: **${gameName}**.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`🌐 PeronDepot Online MultiPlayer Fix Storage Vault`)
                .setDescription(`Search Query Keyword: **${gameName}**\n\nClick any hyperlinked element layout title row text below to download directly via browser:`)
                .setColor('#00FF7F')
                .setTimestamp();

            let descriptionList = '';
            const maxDisplay = results.slice(0, 15);
            maxDisplay.forEach((linkString, index) => {
                descriptionList += `**${index + 1}.** 📥 ${linkString}\n\n`;
            });

            if (results.length > 15) {
                descriptionList += `*...and ${results.length - 15} extra content items found. Narrow your search text string variables if your required element title row isn't visible on the dashboard!*`;
            }

            embed.setDescription(embed.data.description + '\n\n' + descriptionList);
            return interaction.editReply({ embeds: [embed] });
        }

        if (interaction.commandName === 'senddm') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const targetId = interaction.options.getString('user_id'); const messageContent = interaction.options.getString('message');
            try {
                const targetUser = await client.users.fetch(targetId);
                await targetUser.send({ content: messageContent });
                return interaction.editReply(`✅ Successfully sent a DM to **${targetUser.tag}**.`);
            } catch (err) { return interaction.editReply(`❌ Failed to send DM.`); }
        }

        if (interaction.commandName === 'sendchannel') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const targetChannelId = interaction.options.getString('channel_id'); const messageContent = interaction.options.getString('message');
            try {
                const targetChannel = await client.channels.fetch(targetChannelId);
                if (!targetChannel || !targetChannel.isTextBased()) return interaction.editReply(`❌ Invalid channel ID.`);
                await targetChannel.send({ content: messageContent });
                return interaction.editReply(`✅ Successfully sent message to <#${targetChannelId}>.`);
            } catch (err) { return interaction.editReply(`❌ Failed to send message.`); }
        }

        if (interaction.commandName === 'requestgame' || interaction.commandName === 'requestfix') {
            const isFix = interaction.commandName === 'requestfix';
            const appId = interaction.options.getString('game_id');
            await interaction.deferReply({ ephemeral: true });
            if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
            
            const isAvailable = await checkAvailability(appId, isFix);
            if (isAvailable) {
                return interaction.editReply(`❌ **App ID ${appId}** is already available in the Ryuu DB or GitHub Vault!\n👉 Just use \`/${isFix ? 'fixes' : 'gen'} ${appId}\` to download it.`);
            }

            const existingRequest = await RequestTracker.findOne({ appId, status: 'pending' });
            if (existingRequest) return interaction.editReply(`❌ **App ID ${appId}** already has a pending request!`);

            const steam = await getSteam(appId);
            if (!steam) return interaction.editReply('❌ Invalid Steam App ID.');

            await RequestTracker.findOneAndUpdate({ appId: appId }, { requesterId: interaction.user.id, type: isFix ? 'fix' : 'game' }, { upsert: true });

            const embed = new EmbedBuilder()
                .setTitle(`📩 ${isFix ? 'Fix' : 'Game'} Request: ${steam.name}`)
                .setDescription(`**App ID:** \`${appId}\`\n\n*Click the button below and upload the file to fulfill this request.*`)
                .setThumbnail(steam.image).setColor('#5865F2');

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`reqUp_${isFix ? 'fix' : 'game'}_${appId}_${interaction.user.id}`).setLabel('Upload File').setStyle(ButtonStyle.Success).setEmoji('📤'));

            try {
                const centralChannel = await client.channels.fetch(CENTRAL_REQUEST_CHANNEL_ID);
                await centralChannel.send({ content: `🔔 ${isFix ? 'Fix' : 'Game'} Request from <@${interaction.user.id}>`, embeds: [embed], components: [row] });
                return interaction.editReply(`✅ Your request for **${steam.name}** has been sent to the Game Adders!`);
            } catch (err) { return interaction.editReply(`❌ Failed to send request. Central channel not found.`); }
        }

        if (interaction.commandName === 'searchgame') {
            await interaction.deferReply();
            const query = interaction.options.getString('query');
            if (query.length < 3) return interaction.editReply("❌ Your search must be at least 3 characters long.");
            try {
                const steamRes = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(query)}`);
                let results = (Array.isArray(steamRes.data) ? steamRes.data : [])
                    .slice(0, 5)
                    .map(i => ({ name: i.name, appId: i.appid.toString() }));
                
                if (results.length === 0) {
                    results = await Game.find({ name: { $regex: query, $options: 'i' } }).limit(5);
                }

                if (!results || results.length === 0) return interaction.editReply("❌ No games found matching that name.");
                const embed = new EmbedBuilder().setTitle('🔍 Search Results').setColor('#5865F2');
                let desc = ''; results.forEach((g, i) => { desc += `**${i+1}. ${g.name || 'Unknown'}**\nApp ID: \`${g.appId || 'Unknown'}\`\n\n`; });
                embed.setDescription(desc); return interaction.editReply({ embeds: [embed] });
            } catch (err) { return interaction.editReply("❌ Search error."); }
        }

        if (interaction.commandName === 'random') {
            await interaction.deferReply();
            const count = await Game.countDocuments();
            if (count === 0) return interaction.editReply("📭 The vault is empty!");
            const random = await Game.aggregate([{ $sample: { size: 1 } }]);
            if (!random || random.length === 0) return interaction.editReply("❌ Could not pick a random game.");
            const g = random[0];
            const embed = new EmbedBuilder()
                .setTitle(`🎲 Random Game: ${g.name}`)
                .setDescription(g.description || '*No description*')
                .setColor('#0099ff')
                .setFooter({ text: `App ID: ${g.appId} • Use /gen ${g.appId} to download` });
            if (g.image) embed.setImage(g.image);
            if (g.tags && g.tags.length > 0) embed.addFields({ name: 'Tags', value: g.tags.map(t => `\`${t}\``).join(', ') });
            if (g.genre) embed.addFields({ name: 'Genre', value: g.genre });
            return interaction.editReply({ embeds: [embed] });
        }

        if (interaction.commandName === 'reportbroken') {
            await interaction.deferReply({ ephemeral: true });
            const appId = interaction.options.getString('game_id');
            if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
            const game = await Game.findOne({ appId });
            if (!game) return interaction.editReply(`❌ **App ID ${appId}** is not in the vault.`);
            const reason = interaction.options.getString('reason') || 'No reason provided.';
            const existing = await BrokenReport.findOne({ appId, status: 'pending' });
            if (existing) return interaction.editReply("❌ This game already has a pending broken report.");
            await new BrokenReport({ appId, reportedBy: interaction.user.id, reason }).save();
            const channel = await client.channels.fetch(BROKEN_REPORT_CHANNEL_ID).catch(() => null);
            if (channel) {
                const reportEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Broken Report')
                    .setDescription(`**Game:** ${game.name} (\`${appId}\`)\n**Reported by:** <@${interaction.user.id}>\n**Reason:** ${reason}`)
                    .setColor('#ff4747');
                await channel.send({ embeds: [reportEmbed] });
            }
            return interaction.editReply(`✅ Reported **${game.name}** as broken. Staff will review it.`);
        }

        if (interaction.commandName === 'auditlog') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const actionFilter = interaction.options.getString('action');
            const userFilter = interaction.options.getUser('user');
            const limit = Math.min(interaction.options.getInteger('limit') || 25, 100);
            const query = {};
            if (actionFilter) query.action = actionFilter;
            if (userFilter) query.userId = userFilter.id;
            const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(limit);
            if (logs.length === 0) return interaction.editReply("📭 No audit logs match your filters.");
            let desc = logs.map((l, i) => {
                const date = l.createdAt ? `<t:${Math.floor(l.createdAt.getTime() / 1000)}:R>` : 'unknown';
                return `**${i+1}.** \`${l.action}\` — ${l.gameName || l.appId || '—'} by <@${l.userId}> ${date}\n${l.details || ''}`;
            }).join('\n');
            if (desc.length > 4000) desc = desc.substring(0, 4000) + '\n...';
            const embed = new EmbedBuilder().setTitle('📋 Audit Log').setDescription(desc).setColor('#2b2d31').setFooter({ text: `${logs.length} entries` });
            return interaction.editReply({ embeds: [embed] });
        }

        if (interaction.commandName === 'staffstats') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const stats = await AuditLog.aggregate([
                { $group: { _id: { userId: "$userId", userName: "$userName" }, count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            if (stats.length === 0) return interaction.editReply("📭 No staff activity recorded yet.");
            let desc = stats.map((s, i) => {
                const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
                return `${emoji} **${s._id.userName || s._id.userId}**: ${s.count} actions`;
            }).join('\n');
            const embed = new EmbedBuilder().setTitle('📊 Staff Stats').setDescription(desc).setColor('#FFD700');
            return interaction.editReply({ embeds: [embed] });
        }

        if (interaction.commandName === 'tag') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const appId = interaction.options.getString('game_id');
            const tags = interaction.options.getString('tags');
            if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
            const game = await Game.findOne({ appId });
            if (!game) return interaction.editReply(`❌ **App ID ${appId}** not found in vault.`);
            const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            game.tags = [...new Set([...(game.tags || []), ...tagArray])];
            await game.save();
            await addAuditLog('tag', appId, game.name, interaction.user.id, interaction.user.tag, `Added tags: ${tagArray.join(', ')}`);
            return interaction.editReply(`✅ Updated tags for **${game.name}**: ${game.tags.map(t => `\`${t}\``).join(', ')}`);
        }

        if (interaction.commandName === 'setgenre') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const appId = interaction.options.getString('game_id');
            const genre = interaction.options.getString('genre');
            if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
            const game = await Game.findOne({ appId });
            if (!game) return interaction.editReply(`❌ **App ID ${appId}** not found in vault.`);
            game.genre = genre;
            await game.save();
            await addAuditLog('setgenre', appId, game.name, interaction.user.id, interaction.user.tag, `Set genre: ${genre}`);
            return interaction.editReply(`✅ Set genre for **${game.name}** to **${genre}**`);
        }

        if (interaction.commandName === 'searchgenre') {
            await interaction.deferReply();
            const genre = interaction.options.getString('genre');
            const games = await Game.find({
                $or: [
                    { genre: { $regex: genre, $options: 'i' } },
                    { tags: { $regex: genre, $options: 'i' } }
                ]
            }).limit(25);
            if (games.length === 0) return interaction.editReply(`❌ No games found matching **${genre}**.`);
            const embed = new EmbedBuilder().setTitle(`🎮 Games: ${genre}`).setColor('#5865F2');
            let desc = games.map((g, i) => `**${i+1}. ${g.name}**\nApp ID: \`${g.appId}\` ${g.genre ? `• Genre: ${g.genre}` : ''}`).join('\n');
            if (desc.length > 4000) desc = desc.substring(0, 4000) + '\n...';
            embed.setDescription(desc);
            return interaction.editReply({ embeds: [embed] });
        }

        if (interaction.commandName === 'favorites') {
            const sub = interaction.options.getSubcommand();
            if (sub === 'add') {
                await interaction.deferReply({ ephemeral: true });
                const appId = interaction.options.getString('game_id');
                if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
                const game = await Game.findOne({ appId });
                if (!game) return interaction.editReply(`❌ **App ID ${appId}** not found in vault.`);
                let fav = await UserFavorite.findOne({ userId: interaction.user.id });
                if (!fav) fav = new UserFavorite({ userId: interaction.user.id, gameIds: [] });
                if (fav.gameIds.includes(appId)) return interaction.editReply(`❌ **${game.name}** is already in your favorites.`);
                fav.gameIds.push(appId);
                await fav.save();
                return interaction.editReply(`✅ Added **${game.name}** to your favorites!`);
            }
            if (sub === 'remove') {
                await interaction.deferReply({ ephemeral: true });
                const appId = interaction.options.getString('game_id');
                if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
                let fav = await UserFavorite.findOne({ userId: interaction.user.id });
                if (!fav || !fav.gameIds.includes(appId)) return interaction.editReply("❌ That game is not in your favorites.");
                fav.gameIds = fav.gameIds.filter(id => id !== appId);
                await fav.save();
                return interaction.editReply(`✅ Removed from your favorites.`);
            }
            if (sub === 'list') {
                await interaction.deferReply({ ephemeral: true });
                const fav = await UserFavorite.findOne({ userId: interaction.user.id });
                if (!fav || fav.gameIds.length === 0) return interaction.editReply("📭 You have no favorite games yet.");
                const games = await Game.find({ appId: { $in: fav.gameIds } });
                if (games.length === 0) return interaction.editReply("📭 None of your favorites are in the vault anymore.");
                const embed = new EmbedBuilder().setTitle('⭐ Your Favorites').setColor('#FFD700');
                let desc = games.map((g, i) => `**${i+1}. ${g.name}** (\`${g.appId}\`)`).join('\n');
                embed.setDescription(desc);
                return interaction.editReply({ embeds: [embed] });
            }
        }

        if (interaction.commandName === 'togglelimit') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ You do not have permission.', ephemeral: true });
            let config = await BotConfig.findOne(); if (!config) config = new BotConfig();
            config.limitEnabled = !config.limitEnabled; await config.save();
            return interaction.reply({ content: `✅ Global Limit is now **${config.limitEnabled ? 'ENABLED' : 'DISABLED'}**.`, ephemeral: true });
        }

        if (interaction.commandName === 'eliteactivate') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
            const targetUser = interaction.options.getUser('user'); const timeStr = interaction.options.getString('time');
            const durationMs = parseTime(timeStr); if (!durationMs) return interaction.reply({ content: `❌ Invalid time format.`, ephemeral: true });
            try {
                const member = await interaction.guild?.members.fetch(targetUser.id); if(member) await member.roles.add(ELITE_ROLE_ID);
                await EliteSub.findOneAndUpdate({ userId: targetUser.id }, { expiresAt: Date.now() + durationMs }, { upsert: true });
                return interaction.reply({ content: `👑 **Elite Activated!**\nGranted bypass to <@${targetUser.id}> for **${timeStr}**.`, ephemeral: true });
            } catch (err) { return interaction.reply({ content: `❌ Could not find user.`, ephemeral: true }); }
        }

        if (interaction.commandName === 'gen' || interaction.commandName === 'fixes') {
            const isFix = interaction.commandName === 'fixes'; 
            const targetChannel = isFix ? FIXES_CHANNEL_ID : COMMAND_CHANNEL_ID;
            
            const hasBypassRole = interaction.member?.roles?.cache?.has('1496378683575898217');
            
            if (interaction.channelId !== targetChannel && !hasBypassRole) {
                return interaction.reply({ content: `❌ Please use this command in <#${targetChannel}>.`, ephemeral: true });
            }

            let limitRes = { blocked: false, limitActive: false };
            if (!isFix) {
                const isElite = interaction.member?.roles?.cache?.has(ELITE_ROLE_ID) || hasBypassRole;
                limitRes = await checkRateLimit(interaction.user.id, isElite);
                
                if (limitRes.blocked) {
                    return interaction.reply({ content: `⏳ **Daily Limit Reached!** Please wait **${limitRes.hours}h ${limitRes.mins}m**.`, ephemeral: true });
                }
            }

            await interaction.deferReply(); 
            const rawQuery = interaction.options.getString('game_id');
            let appId = rawQuery;
            
            if (!/^\d+$/.test(rawQuery)) {
                const fallbackGame = await Game.findOne({ name: { $regex: rawQuery, $options: 'i' } });
                if (fallbackGame) {
                    appId = fallbackGame.appId;
                } else {
                    try {
                        const steamRes = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(rawQuery)}`);
                        if (steamRes.data && Array.isArray(steamRes.data) && steamRes.data.length > 0) {
                            appId = steamRes.data[0].appid.toString();
                        }
                    } catch (e) {}
                }
            }

            if (!/^\d+$/.test(appId)) {
                return interaction.editReply(`❌ Could not find a game matching **${rawQuery}**. Try using the exact Steam App ID!`);
            }

            const steamData = await getSteam(appId);
            const fallbackDesc = steamData?.description || '*No description provided by Steam.*';
            const sanitizedName = (steamData?.name || appId).replace(/[^a-zA-Z0-9]/g, '_'); 
            const embed = new EmbedBuilder().setColor(isFix ? '#ff4747' : '#0099ff').setTitle(steamData?.name || `App ID: ${appId}`).setDescription(fallbackDesc).setFooter({ text: `App ID: ${appId}` });
            if (steamData?.image) embed.setImage(steamData.image);

            const deliverPrivate = async (contentObj) => {
                await interaction.editReply({ embeds: [embed] }); 
                await interaction.followUp({ ...contentObj, ephemeral: true }); 
                if (limitRes.limitActive && !interaction.member?.roles?.cache?.has(ELITE_ROLE_ID)) {
                    await interaction.followUp({ content: `ℹ️ You have **${limitRes.remaining}** game generations left for today. Get VIP for unlimited games.`, ephemeral: true });
                }
            };

            let branded = null;
            let g = null;

            if (!isFix) {
                branded = await processRyuuApi(appId, steamData?.name);
            }

            if (!branded) {
                g = await Game.findOne({ appId: appId });
                let potentialUrls = [];
                
                if (isFix) {
                    if (g && g.fixGithubPath) potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${g.fixGithubPath}`, isLua: g.fixGithubPath.endsWith('.lua') });
                    potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}_fix.lua`, isLua: true });
                    potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}_fix.zip`, isLua: false });
                } else {
                    if (g && g.githubPath) potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${g.githubPath}`, isLua: g.githubPath.endsWith('.lua') });
                    potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}.lua`, isLua: true });
                    potentialUrls.push({ url: `https://raw.githubusercontent.com/steamtoolsbot-dhyey/filebase/main/${appId}.zip`, isLua: false });
                }

                for (const target of potentialUrls) {
                    branded = await processBrandedZipOnDisk(appId, steamData?.name, target.url, { 'Authorization': `token ${GITHUB_TOKEN}` }, target.isLua);
                    if (branded) break; 
                }
            }

            if (branded) {
                const result = await deliverPrivate({ content: "📥 **Here is your file:**", files: [new AttachmentBuilder(branded.finalPath, { name: `${sanitizedName}_Vault.zip` })] });
                branded.cleanup(); return result;
            } else {
                if (!g) g = await Game.findOne({ appId: appId });
                if (g && (isFix ? g.fileId : g.fileId)) {
                    return deliverPrivate({ content: `📥 **[Drive Download Link](https://drive.google.com/uc?export=download&id=${isFix ? g.fixId : g.fileId})**` });
                } else if (g && (isFix ? g.fixUrl : g.fileUrl)) {
                    return deliverPrivate({ content: `📥 **[Legacy Link](${isFix ? g.fixUrl : g.fileUrl})**` });
                }
            }

            return interaction.editReply({ content: `❌ Not found in our RYUU DB or HatManifets Vault!\n👉 **Type \`/request${isFix?'fix':'game'}\` to request it!**`, embeds: [] });
        }

        if (interaction.commandName === 'dlc') {
            await interaction.deferReply();
            const rawQuery = interaction.options.getString('game_id');
            const apiKey = process.env.MORRENUS_API_KEY;

            if (!apiKey) {
                return interaction.editReply({ content: '❌ **API configuration error: `MORRENUS_API_KEY` is missing from your .env file.**' });
            }

            let appId = rawQuery;
            
            if (!/^\d+$/.test(rawQuery)) {
                const fallbackGame = await Game.findOne({ name: { $regex: rawQuery, $options: 'i' } });
                if (fallbackGame) {
                    appId = fallbackGame.appId;
                } else {
                    try {
                        const steamRes = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(rawQuery)}`);
                        if (steamRes.data && Array.isArray(steamRes.data) && steamRes.data.length > 0) {
                            appId = steamRes.data[0].appid.toString();
                        }
                    } catch (e) {}
                }
            }

            if (!/^\d+$/.test(appId)) {
                return interaction.editReply(`❌ Could not find a game matching **${rawQuery}**. Try using the exact Steam App ID!`);
            }

            try {
                const response = await axios.get(`https://hubcapmanifest.com/api/v1/lua/dlc/${appId}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    responseType: 'arraybuffer' 
                });

                const buffer = Buffer.from(response.data);
                const attachment = new AttachmentBuilder(buffer, { name: `${appId}_dlc.lua` });

                const embed = new EmbedBuilder()
                    .setTitle(`🚀 Morrenus DLC Config Generated`)
                    .setDescription(`Successfully retrieved the DLC Lua manifest for App ID **${appId}** using the Morrenus database.`)
                    .setColor('#0099FF');

                return interaction.editReply({ embeds: [embed], files: [attachment] });

            } catch (apiError) {
                console.error('❌ Morrenus API Error:', apiError.response ? apiError.response.data.toString() : apiError.message);
                return interaction.editReply({ content: '❌ **An error occurred while connecting to the Morrenus API.** Check your API key or ensure the game has DLCs.' });
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('reqUp_')) {
                if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
                const parts = interaction.customId.split('_'); const type = parts[1]; const appId = parts[2]; const isFix = type === 'fix';
                
                await interaction.reply({ content: `📤 You have **60 seconds** to upload the file for App ID \`${appId}\` in this channel. Drop it now!`, ephemeral: true });
                const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
                const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

                collector.on('collect', async m => {
                    const file = m.attachments.first();

                    if (!isValidGameFile(file.name)) {
                        await interaction.followUp({ content: `❌ Invalid file type: \`${file.name}\`. Only **.zip** and **.lua** files are accepted.`, ephemeral: true });
                        m.delete().catch(() => {});
                        return;
                    }

                    const waitMsg = await interaction.followUp({ content: `⏳ Pushing **${file.name}** to GitHub Vault... Please wait.`, ephemeral: true });
                    const steam = await getSteam(appId); if (!steam) return waitMsg.edit('❌ Invalid Steam ID.');

                    let uploadedGithubPath = await uploadToGitHub(file.url, file.name); let uploadedFileId = null;
                    if (!uploadedGithubPath) {
                        await waitMsg.edit(`⚠️ GitHub rejected the file. Rerouting to Google Drive Failsafe...`);
                        uploadedFileId = await uploadToDrive(file.url, file.name);
                        if (!uploadedFileId) return waitMsg.edit('❌ CRITICAL ERROR: Both GitHub and Google Drive uploads failed.');
                    }

                    const updateData = isFix ? { fixGithubPath: uploadedGithubPath, fixId: uploadedFileId, fixAddedBy: interaction.user.tag } : { githubPath: uploadedGithubPath, fileId: uploadedFileId, addedBy: interaction.user.tag };
                    await Game.findOneAndUpdate({ appId: appId }, { ...steam, ...updateData }, { upsert: true });
                    
                    let finalRequesterId = parts[3]; 
                    const trackedReq = await RequestTracker.findOne({ appId: appId });
                    if (trackedReq) { finalRequesterId = trackedReq.requesterId; await RequestTracker.deleteOne({ appId: appId }); }

                    await addAuditLog(isFix ? 'addfix' : 'addgame', appId, steam.name, interaction.user.id, interaction.user.tag, `Uploaded: ${file.name}`);

                    await sendNotification(steam, isFix, interaction.user.id, appId, finalRequesterId);
                    await waitMsg.edit(`✅ Successfully uploaded to ${uploadedGithubPath ? 'GitHub' : 'Google Drive'} and saved **${steam.name}**!`);
                    m.delete().catch(() => {});

                    const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setColor('#00FF00').setTitle(`✅ Completed: ${steam.name}`).setDescription(`**App ID:** \`${appId}\`\n\n*Fulfilled by <@${interaction.user.id}>*`);
                    await interaction.message.edit({ embeds: [originalEmbed], components: [] });

                    if (finalRequesterId) {
                        try {
                            const requester = await client.users.fetch(finalRequesterId);
                            if (requester) {
                                const dmEmbed = new EmbedBuilder().setTitle('✅ Request Fulfilled!').setDescription(`Your request for **${steam.name}** has been uploaded to the vault by <@${interaction.user.id}>!\n\n${steam.description || ''}\n\n👉 Go to <#${COMMAND_CHANNEL_ID}> and type \`/${isFix ? 'fixes' : 'gen'} ${appId}\` to download it!`).setColor('#00FF00');
                                if (steam.image) dmEmbed.setImage(steam.image);
                                platform.send({ embeds: [dmEmbed] });
                            }
                        } catch (err) {}
                    }
                });
                collector.on('end', collected => { if (collected.size === 0) interaction.followUp({ content: '❌ Time expired.', ephemeral: true }); });
                return;
            }

           if (interaction.customId === 'apply_staff') {
    await interaction.deferReply({ ephemeral: true });
    
    let cfg = await TicketConfig.findOne();
    if (!cfg) cfg = new TicketConfig();
    cfg.count++;
    await cfg.save();

    try {
        const ch = await interaction.guild.channels.create({
            name: `staffapp-${cfg.count.toString().padStart(4, '0')}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`staffapp_accept_${interaction.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`staffapp_close_${interaction.user.id}`).setLabel('Close').setStyle(ButtonStyle.Secondary)
        );

        await ch.send({
            content: `<@${interaction.user.id}>`,
            embeds: [new EmbedBuilder().setTitle('Staff Application').setDescription('Applying for Game Adder / Support role. Please explain why you want to join the team.').setColor('#FFD700')],
            components: [row]
        });

        return interaction.editReply(`✅ Application Ticket Created: <#${ch.id}>`);
    } catch (error) {
        console.error('❌ Error creating staff application channel:', error);
        return interaction.editReply('❌ **Failed to create the application channel.**\n*Ensure the bot has "Manage Channels" permissions and that your `TICKET_CATEGORY_ID` is a valid category ID.*');
    }
}

            if (interaction.customId.startsWith('staffapp_')) {
                const [_, action, userId] = interaction.customId.split('_');
                if (action === 'accept') {
                    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
                    try { const member = await interaction.guild.members.fetch(userId); await member.roles.add(GAME_ADDER_ROLE_ID); await interaction.reply({ content: `🎉 <@${userId}> is now Staff!`, ephemeral: true }); } catch { await interaction.reply({ content: `❌ Error giving role.`, ephemeral: true }); }
                }
                if (action === 'close') {
                    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && interaction.user.id !== userId) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
                    await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: true }); await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: false });
                    await interaction.channel.send({ embeds: [new EmbedBuilder().setTitle('🔒 Closed').setColor('#2b2d31')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`staffapp_delete_${userId}`).setLabel('Delete').setStyle(ButtonStyle.Danger))] });
                }
                if (action === 'delete') {
                    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
                    await interaction.reply({ content: '🗑️ Deleting...', ephemeral: true }); setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                }
                return;
            }

            if (interaction.customId.startsWith('support_ticket_')) {
                const [_, __, action, userId] = interaction.customId.split('_'); const isStaff = checkSupportAuth(interaction);
                if (action === 'claim') {
                    if (!isStaff) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
                    await interaction.deferUpdate(); return interaction.message.edit({ embeds: [EmbedBuilder.from(interaction.message.embeds[0]).setColor('#00FF00').addFields({ name: '🛠️ Assigned To', value: `<@${interaction.user.id}>` })], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`support_ticket_close_${userId}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'))] });
                }
                if (action === 'close') {
                    if (!isStaff && interaction.user.id !== userId) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
                    await interaction.deferUpdate(); await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: false });
                    return interaction.message.edit({ embeds: [new EmbedBuilder().setTitle('🔒 Ticket Closed').setDescription(`Closed by <@${interaction.user.id}>.`).setColor('#2b2d31').setTimestamp()], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`support_ticket_reopen_${userId}`).setLabel('Reopen Ticket').setStyle(ButtonStyle.Success).setEmoji('🔓'), new ButtonBuilder().setCustomId(`support_ticket_delete_${userId}`).setLabel('Delete Ticket').setStyle(ButtonStyle.Danger).setEmoji('🗑️'))] });
                }
                if (action === 'delete') {
                    if (!isStaff) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
                    await interaction.deferUpdate(); await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle('🗑️ Deleting Ticket...').setDescription(`Ticket will be deleted in **10 seconds**.\nClick to cancel.`).setColor('#ff4747')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`support_ticket_reopen_${userId}`).setLabel('Cancel Deletion').setStyle(ButtonStyle.Success).setEmoji('🛑'))] });
                    const timer = setTimeout(async () => { await interaction.channel.delete().catch(() => {}); deletionTimers.delete(interaction.channel.id); }, 10000); deletionTimers.set(interaction.channel.id, timer); return;
                }
                if (action === 'reopen') {
                    if (!isStaff) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
                    if (deletionTimers.has(interaction.channel.id)) { clearTimeout(deletionTimers.get(interaction.channel.id)); deletionTimers.delete(interaction.channel.id); }
                    await interaction.deferUpdate(); await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: true, SendMessages: true });
                    return interaction.message.edit({ embeds: [new EmbedBuilder().setTitle('🔓 Ticket Reopened').setDescription(`Reopened by <@${interaction.user.id}>.`).setColor('#5865F2')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`support_ticket_close_${userId}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'))] });
                }
            }
        }
        
        if (interaction.isStringSelectMenu() && interaction.customId === 'support_ticket_select') {
            const category = interaction.values[0]; const modal = new ModalBuilder().setCustomId(`support_ticket_modal_${category}`).setTitle(`Support: ${category}`);
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('issue_desc').setLabel('Describe your issue').setStyle(TextInputStyle.Paragraph).setRequired(true))); return interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('support_ticket_modal_')) {
    const category = interaction.customId.replace('support_ticket_modal_', '');
    const issueDesc = interaction.fields.getTextInputValue('issue_desc');
    await interaction.deferReply({ ephemeral: true });

    let cfg = await TicketConfig.findOne();
    if (!cfg) cfg = new TicketConfig();
    cfg.count++;
    await cfg.save();

    try {
        const ch = await interaction.guild.channels.create({
            name: `ticket-${cfg.count.toString().padStart(4, '0')}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`support_ticket_close_${interaction.user.id}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        const embed = new EmbedBuilder()
            .setTitle(`🛠️ Support Ticket: ${category}`)
            .setDescription(`**User:** <@${interaction.user.id}>\n**Issue:** ${issueDesc}`)
            .setColor('#5865F2')
            .setTimestamp();

        await ch.send({ content: `<@${interaction.user.id}> | Support Team`, embeds: [embed], components: [row] });
        return interaction.editReply(`✅ Ticket Opened Successfully: <#${ch.id}>`);
    } catch (error) {
        console.error('❌ Error creating support ticket channel:', error);
        return interaction.editReply('❌ **Failed to create the ticket channel.**\n*Ensure the bot has "Manage Channels" permissions and that your `TICKET_CATEGORY_ID` is a valid category ID.*');
    }
}

        if (interaction.commandName === 'database-current') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const games = await Game.find().sort({ name: 1 });
            if (games.length === 0) return interaction.editReply("📭 The database is currently empty.");

            let output = `🎮 CURRENT DATABASE EXTRACT (${games.length} Games)\n======================================================\n\n`;
            games.forEach(g => {
                output += `[${g.appId}] ${g.name}\n   - Added By: ${g.addedBy || 'Unknown'}\n   - Game File: ${g.githubPath ? '✅ GitHub ('+g.githubPath+')' : (g.fileId ? '✅ Drive' : '❌ None')}\n   - Fix File:  ${g.fixGithubPath ? '✅ GitHub ('+g.fixGithubPath+')' : (g.fixId ? '✅ Drive' : '❌ None')}\n------------------------------------------------------\n`;
            });
            const attachment = new AttachmentBuilder(Buffer.from(output, 'utf-8'), { name: 'Database_Current.txt' });
            return interaction.editReply({ content: `✅ Generated a full list of all **${games.length}** games in the database! Download the file below:`, files: [attachment] });
        }

        if (interaction.commandName === 'setupticketpanel') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const embed = new EmbedBuilder().setTitle('🛠️ Support Center').setDescription('Select a category below to open a ticket.').setColor('#2b2d31').setThumbnail(client.user.displayAvatarURL());
            const menu = new StringSelectMenuBuilder().setCustomId('support_ticket_select').setPlaceholder('Select an option...').addOptions([{ label: 'Fixes', description: 'Help with installing or running a game fix', value: 'Fixes', emoji: '🔧' }, { label: 'Report', description: 'Report a user breaking the rules', value: 'Report', emoji: '⚠️' }, { label: 'Game Files', description: 'Issues with downloads, archives, or files', value: 'Game Files', emoji: '📁' }, { label: 'Bugs', description: 'Report a bug with the Discord bot', value: 'Bugs', emoji: '🐛' }]);
            await interaction.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] }); return interaction.editReply({ content: '✅ Ticket panel spawned!' });
        }

        if (interaction.commandName === 'setupstaff') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const embed = new EmbedBuilder().setTitle('🛡️ Staff Applications').setDescription('Click below to apply to be a Game Adder or Support Staff!').setColor('#2b2d31');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('apply_staff').setLabel('Apply').setStyle(ButtonStyle.Success));
            await interaction.channel.send({ embeds: [embed], components: [row] }); return interaction.editReply({ content: '✅ Staff panel spawned!' });
        }

        if (interaction.commandName === 'togglestaff') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const msgs = await interaction.channel.messages.fetch({ limit: 15 });
            const panel = msgs.find(m => m.components.length > 0 && m.components[0].components[0].customId === 'apply_staff');
            if (!panel) return interaction.editReply('❌ Staff Panel not found recently in this channel.');
            const closed = panel.components[0].components[0].disabled;
            await panel.edit({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('apply_staff').setLabel(closed ? 'Apply' : 'Applications Closed').setStyle(closed ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(!closed))] });
            return interaction.editReply(`✅ Toggled!`);
        }

        if (interaction.commandName === 'syncvault') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            try {
                const allGames = await Game.find({}); let syncCount = 0; let skipCount = 0; let error403Count = 0; let aborted = false;
                await interaction.editReply(`⏳ Scanning database...`);
                for (const g of allGames) {
                    if (aborted) break; let needsSave = false;
                    if (g.fileId && !g.githubPath) {
                        const fileName = `${g.name.replace(/[^a-zA-Z0-9]/g, '_')}_Game.zip`;
                        const result = await transferDriveToGitHub(g.fileId, fileName);
                        if (result === 'ERROR_403') { error403Count++; if (error403Count >= 2) { aborted = true; break; } } 
                        else if (result) { g.githubPath = result; needsSave = true; syncCount++; } else { skipCount++; }
                    }
                    if (needsSave) { await Game.updateOne({ appId: g.appId }, { githubPath: g.githubPath }); await new Promise(resolve => setTimeout(resolve, 2000)); }
                }
                return interaction.followUp({ content: `✅ **Vault Sync ${aborted ? 'ABORTED' : 'Complete'}!**\n📥 Pushed **${syncCount}** games to GitHub. Skipped **${skipCount}**.`, ephemeral: true });
            } catch (err) { return interaction.followUp({ content: '❌ Error syncing vault.', ephemeral: true }); }
        }

        if (interaction.commandName === 'clearfixes') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            try { 
                await Game.updateMany({}, { $unset: { fixId: "", fixUrl: "", fixGithubPath: "", fixAddedBy: "" } }); 
                return interaction.editReply('✅ Successfully wiped all legacy Fix data from the database!'); 
            } catch (err) { return interaction.editReply('❌ Failed to clear fixes.'); }
        }

        if (interaction.commandName === 'fixdb') {
            if (!BOT_OWNERS.includes(interaction.user.id)) return interaction.reply({ content: '❌ Owners only.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const brokenGames = await Game.find({ $or: [{ description: null }, { image: null }] });
            if (brokenGames.length === 0) return interaction.editReply("✅ Your database is perfectly healthy!");
            await interaction.editReply(`⏳ Found **${brokenGames.length}** broken entries. Starting auto-repair...`);
            let fixedCount = 0;
            for (const g of brokenGames) {
                const freshData = await getSteam(g.appId);
                if (freshData && freshData.description) { await Game.updateOne({ appId: g.appId }, { description: freshData.description, image: freshData.image }); fixedCount++; }
                await new Promise(resolve => setTimeout(resolve, 1500)); 
            }
            return interaction.followUp({ content: `✅ **Database Auto-Repair Complete!** Fixed **${fixedCount}** games.`, ephemeral: true });
        }

        if (interaction.commandName === 'stop') { if (BOT_OWNERS.includes(interaction.user.id)) process.exit(0); }

        if (interaction.commandName === 'addeasy') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            const file = interaction.options.getAttachment('file'); const match = file.name.match(/\d+/); 
            if (!match) return interaction.reply({ content: `❌ No App ID found in filename.`, ephemeral: true });
            await interaction.deferReply({ ephemeral: true }); 
            const appId = match[0]; const steam = await getSteam(appId); 
            if (!steam) return interaction.editReply(`❌ Invalid Steam ID (${appId}).`);
            let uploadedGithubPath = await uploadToGitHub(file.url, file.name); let uploadedFileId = null;
            if (!uploadedGithubPath) { uploadedFileId = await uploadToDrive(file.url, file.name); if (!uploadedFileId) return interaction.editReply('❌ CRITICAL ERROR: Both GitHub and Drive uploads failed.'); }
            await Game.findOneAndUpdate({ appId: appId }, { ...steam, githubPath: uploadedGithubPath, fileId: uploadedFileId, addedBy: interaction.user.tag }, { upsert: true }); 
            await addAuditLog('addeasy', appId, steam.name, interaction.user.id, interaction.user.tag, `Quick add from filename`);
            await sendNotification(steam, false, interaction.user.id, appId); 
            return interaction.editReply(`✅ Automatically extracted ID **${appId}** and saved **${steam.name}**!`);
        }

        if (interaction.commandName === 'addgame' || interaction.commandName === 'addfix') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            const isFix = interaction.commandName === 'addfix'; const appId = interaction.options.getString('game_id'); const file = interaction.options.getAttachment('file'); 
            await interaction.deferReply({ ephemeral: true }); 
            const steam = await getSteam(appId); if (!steam) return interaction.editReply('❌ Invalid Steam ID.');

            if (!isValidGameFile(file.name)) {
                return interaction.editReply(`❌ Invalid file type: \`${file.name}\`. Only **.zip** and **.lua** files are accepted.`);
            }

            let uploadedGithubPath = await uploadToGitHub(file.url, file.name); let uploadedFileId = null;
            if (!uploadedGithubPath) { uploadedFileId = await uploadToDrive(file.url, file.name); if (!uploadedFileId) return interaction.editReply('❌ CRITICAL ERROR: Both GitHub and Drive uploads failed.'); }
            const updateData = isFix ? { fixGithubPath: uploadedGithubPath, fixId: uploadedFileId, fixAddedBy: interaction.user.tag } : { githubPath: uploadedGithubPath, fileId: uploadedFileId, addedBy: interaction.user.tag };
            await Game.findOneAndUpdate({ appId: appId }, { ...steam, ...updateData }, { upsert: true }); 
            await addAuditLog(isFix ? 'addfix' : 'addgame', appId, steam.name, interaction.user.id, interaction.user.tag, `Uploaded: ${file.name}`);            await sendNotification(steam, isFix, interaction.user.id, appId); 
            return interaction.editReply(`✅ Successfully saved **${steam.name}**!`);
        }

        if (interaction.commandName === 'addmanual') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            const appId = interaction.options.getString('game_id'); const driveId = interaction.options.getString('drive_id');
            await interaction.deferReply({ ephemeral: true }); 
            const steam = await getSteam(appId); if (!steam) return interaction.editReply('❌ Invalid Steam ID.');
            await Game.findOneAndUpdate({ appId: appId }, { ...steam, fixId: driveId, fixGithubPath: null, fixAddedBy: interaction.user.tag }, { upsert: true }); 
            await addAuditLog('addmanual', appId, steam.name, interaction.user.id, interaction.user.tag, `Manual Drive ID: ${driveId}`);
            await sendNotification(steam, true, interaction.user.id, appId); 
            return interaction.editReply(`✅ Successfully linked **${steam.name} FIX** directly to Google Drive ID: \`${driveId}\`!`);
        }

        if (interaction.commandName === 'leaderboard') {
            const statsData = await Game.aggregate([
                { $match: { addedBy: { $exists: true, $ne: null } } },
                { $group: { _id: "$addedBy", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            let stats = statsData;
            const myTag = "dhyey018"; let found = false;
            for (let i = 0; i < stats.length; i++) { if (stats[i]._id === myTag) { stats[i].count += 60000; found = true; break; } }
            if (!found) stats.push({ _id: myTag, count: 60000 });
            stats.sort((a, b) => b.count - a.count);
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 Leaderboard').setDescription(stats.map((u, i) => `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤"} **${u._id}**: ${u.count}`).join('\n') || "No data.").setColor('#FFD700')] });
        }

        if (interaction.commandName === 'addfixentry') {
            if (!checkStaffAuth(interaction)) return interaction.reply({ content: '❌ Staff only.', ephemeral: true });
            const appId = interaction.options.getString('game_id');
            const version = interaction.options.getString('version') || '1.0';
            const notes = interaction.options.getString('notes') || '';
            const file = interaction.options.getAttachment('file');
            if (!file) return interaction.reply({ content: '❌ You must attach a file.', ephemeral: true });
            if (!isValidGameFile(file.name)) return interaction.reply({ content: `❌ Invalid file type: \`${file.name}\`. Only **.zip** and **.lua** files are accepted.`, ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const steam = await getSteam(appId);
            if (!steam) return interaction.editReply('❌ Invalid Steam App ID.');
            let uploadedGithubPath = await uploadToGitHub(file.url, file.name);
            let uploadedFileId = null;
            if (!uploadedGithubPath) {
                uploadedFileId = await uploadToDrive(file.url, file.name);
                if (!uploadedFileId) return interaction.editReply('❌ Upload failed.');
            }
            await new GameFix({
                appId, name: steam.name, description: steam.description, image: steam.image,
                githubPath: uploadedGithubPath, fileId: uploadedFileId,
                addedBy: interaction.user.tag, version, notes
            }).save();
            await addAuditLog('addfixentry', appId, steam.name, interaction.user.id, interaction.user.tag, `Fix v${version}: ${file.name}${notes ? ' — ' + notes : ''}`);
            return interaction.editReply(`✅ Fix v${version} for **${steam.name}** saved to the Fixes DB!`);
        }

        if (interaction.commandName === 'listfixes') {
            await interaction.deferReply();
            const appId = interaction.options.getString('game_id');
            if (!/^\d+$/.test(appId)) return interaction.editReply("❌ Please provide a valid numeric Steam App ID.");
            const game = await Game.findOne({ appId });
            const fixes = await GameFix.find({ appId }).sort({ createdAt: -1 });
            if ((!game || !game.fixGithubPath) && fixes.length === 0) return interaction.editReply(`❌ No fixes found for App ID **${appId}**.`);
            const embed = new EmbedBuilder().setTitle(`🔧 Fixes: ${game?.name || appId}`).setColor('#ff4747');
            let desc = '';
            if (game?.fixGithubPath || game?.fixId) {
                desc += `**Legacy Fix:** ${game.fixGithubPath ? `✅ GitHub (${game.fixGithubPath})` : game.fixId ? '✅ Drive' : '❌ None'}\n`;
                if (game.fixAddedBy) desc += `Added by: ${game.fixAddedBy}\n`;
                desc += `Use \`/fixes ${appId}\` to download\n\n`;
            }
            if (fixes.length > 0) {
                desc += fixes.map((f, i) => {
                    let info = `**v${f.version}** — ${f.addedBy || 'Unknown'}`;
                    if (f.notes) info += `\n📝 ${f.notes}`;
                    info += `\n${f.githubPath ? '✅ GitHub' : f.fileId ? '✅ Drive' : '❌'}`;
                    return info;
                }).join('\n\n');
            }
            embed.setDescription(desc);
            return interaction.editReply({ embeds: [embed] });
        }

    } catch (error) {
        if (error.code === 10062 || error.code === 40060) return; 
        console.error('❌ Unhandled Interaction Error:', error);
        
        try {
            const fallbackMsg = { content: '❌ **An internal error occurred.**\n*Ensure the bot has "Manage Channels" permissions and `TICKET_CATEGORY_ID` is correct.*', ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(fallbackMsg);
            } else {
                await interaction.reply(fallbackMsg);
            }
        } catch (e) {}
    }
});

client.login(BOT_TOKEN);

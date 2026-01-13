const express = require('express');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// SETTINGS FILE
// =========================
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Default settings
const DEFAULT_SETTINGS = {
    USERGET_PAYLOAD: {
        "atte": 4,
        "TZ": "+05",
        "nce": 4,
        "DT": "eznWBxbPRraLyiAJsunhuc:APA91bEuOcRCY7OPDPAZlMeS3FMBDlXG9r7Aa_xB95xWeJDxs4Sh9WkyC-6N-LhmjxHftCxKCS4GGx08rHgJi54mgsueL7LxTuymsQ5k_Ar_9ByxBpI400g",
        "AT": "EAAFj4OtIJSMBQVyM1rgEVZCIyq5cuMYXNxcBBl5uuEtC7kmKzqC0c0i5rNsad0Mb3TBkvhxpiujqWCUU8TODZB9X8PFo8T9H1Wva2Ir72Em4fOW5HdmL6y9KSywFLW4Ykvzpnf2J4AMw9xZCqqm7kjmk5wDjZAOZBeXLpZArbRWogCHbF366zZAt8dkwTZCnVl5KAZAw0xDiOIJqkNazVUPTTa8exgqKaLI0nANNjZARZCJXBZBv9FZCny2Fd4rpIZB0hLZA10hHlK2CS7Jwti5q8ZB4RevDCCXc3yLPgjmWZAsCx1FYGlKOhHuDTXiGjocETdJpvsoYZD",
        "name": "Faiz Ali",
        "email": "chilly94949@gmail.com",
        "DMem": 3.8465499877929688,
        "snuid": "122103496245085162",
        "DM": "samsung SM-N976N",
        "duid": "f07113a699b6440b",
        "idfa": "5323a3cc-f1ba-48d1-b93f-2605dbdd1521",
        "snid": 3,
        "os": "gplay",
        "cv": 321,
        "UI": "6905e76aed87400001edf0fd",
        "adAttribution": "{\"network\":\"Organic\"}",
        "roomId": "",
        "spl": "",
        "la": "en"
    },
    JO_PAYLOAD: "eyJSSCI6ImpvIiwiUFUiOiIiLCJQWSI6IntcIkVQXCI6XCJGTzcxVnA0all3Y2d4VXIyZzJjMWZEeitLbUMzRHJTSGZxZmVmamFzSVFvVUJ5c2RhN01OTkNLbHJpNElMVHd3dEdsQW1zSDNmY3c0R0RNYWlScUdURkIxSFQ1Q201K01EZ1dwaUF3VlV6U0ZJNW9MZExCVlVIU01VZUZsMHh5aDVuWlA4ZFZveTB0SmVHTU82SEJsbGh5ZzRjdHpkYWVUUnplWWIvQ1VQekZyYnNWcmt1UG9MWmpGSkZCQUxSWjBMaU5MT0RJRk5HN1FsRURuaVJSejUxSUswWVJ1TU1BWkhqci8zM2Z3L1ZRQzNDaGpDWWJRUGIzbGZCSTJwbWs9XCIsXCJLRVlcIjpcIklsQVEzODh5RS81cGdObHA4RDc1WkxVWnhMZmd6QS9NbWJEWWx3ME5GbUJyWDlRMjVxZ1ZTalh4SjYrMC9BTS9yTDV5VUppSG14ODhVQVBmalorQUV4bGJmQk1XODhGNlRqb3NzYUpXTVJqaEpFV0pLUW1Yd3JEREV4U2xEd0phczZoR1puN1QvNDhpOW9KTkV3K21hY3dqUm4vclZ6UTVIMCtNV3pCUjFJZlJNVHdReUVVNUpzd2l1eS9FL1dPNUYwYU95T3JveHRRcmM5VHFxUzJZQlVONHhzYkxUUk5wYU42UEpuS2Q3bnN4dWtycHhSdUd0NGNiSitFTVJlbVhmVEFlVTViZnY3TjN2aWh4WTBObllGZ1V2RzE4NG5Xa2FuWHpEVzNFa0FyaGkvMlE1M1dNNlRsZW9RR3JWUE1ES0Q4eXBPaEplY01UZE1ud2g0bHI1UT09XCJ9IiwiRU4iOnRydWV9",
    HEARTBEAT_ACK: "eyJSSCI6ImhhIiwiUFUiOiIiLCJQWSI6Int9In0=",
    AUTH_CONFIRM_REPLY: "eyJSSCI6InN0IiwiUFUiOiJHVCIsIlBZIjoiIn0=",
    API_URL: "https://api.ls.superkinglabs.com/api/userget",
    WS_URL: "ws://ws.ls.superkinglabs.com/ws"
};

// Load settings
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            const settings = JSON.parse(data);
            console.log('[SETTINGS] Loaded from settings.json');
            return { ...DEFAULT_SETTINGS, ...settings };
        }
    } catch (error) {
        console.log('[SETTINGS] Error loading settings:', error.message);
    }
    
    // Create default settings file
    saveSettings(DEFAULT_SETTINGS);
    console.log('[SETTINGS] Created default settings.json');
    return DEFAULT_SETTINGS;
}

// Save settings
function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.log('[SETTINGS] Error saving settings:', error.message);
        return false;
    }
}

// Current settings (loaded on startup)
let SETTINGS = loadSettings();

// =========================
// HEADERS
// =========================
const HEADERS = {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "okhttp/4.9.3"
};

// =========================
// STATE
// =========================
let gameWs = null;
let connectedClients = new Set();

// =========================
// MIDDLEWARE
// =========================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// =========================
// HELPER FUNCTIONS
// =========================
function getRH(b64Msg) {
    try {
        const decoded = JSON.parse(Buffer.from(b64Msg, 'base64').toString('utf-8'));
        return decoded.RH || "?";
    } catch {
        return "?";
    }
}

function broadcast(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function log(msg, type = 'info') {
    console.log(`[${new Date().toISOString()}] ${msg}`);
    broadcast('log', { message: msg, type });
}

// =========================
// USERGET API
// =========================
async function doUserGet() {
    log('[USERGET] Running /api/userget ...', 'info');
    try {
        const response = await fetch(SETTINGS.API_URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(SETTINGS.USERGET_PAYLOAD),
            timeout: 30000
        });

        const text = await response.text();
        log(`[✓] userget status: ${response.status}`, response.ok ? 'success' : 'error');
        
        if (response.ok) {
            try {
                const jsonData = JSON.parse(text);
                broadcast('userget', jsonData);
            } catch {}
        }
        
        return response.ok;
    } catch (error) {
        log(`[!] userget error: ${error.message}`, 'error');
        return false;
    }
}

// =========================
// GAME WEBSOCKET
// =========================
function connectGameWs() {
    log('[WS] Connecting to game server...', 'info');
    log(`[WS] URL: ${SETTINGS.WS_URL}`, 'info');
    
    gameWs = new WebSocket(SETTINGS.WS_URL);

    gameWs.on('open', () => {
        log('[WS] Connected ✅', 'success');
        broadcast('status', { ws: true, login: false, auth: false });
        
        log('[WS] Sending JO payload...', 'info');
        gameWs.send(SETTINGS.JO_PAYLOAD);
        broadcast('sent', { message: SETTINGS.JO_PAYLOAD, rh: getRH(SETTINGS.JO_PAYLOAD) });
    });

    gameWs.on('message', (data) => {
        const message = data.toString();
        const rh = getRH(message);
        
        broadcast('received', { message, rh });

        // Heartbeat
        if (rh === 'hb') {
            gameWs.send(SETTINGS.HEARTBEAT_ACK);
            broadcast('sent', { message: SETTINGS.HEARTBEAT_ACK, rh: 'ha' });
            broadcast('heartbeat', {});
            return;
        }

        // Login Response
        if (rh === 'JO') {
            log('═'.repeat(50), 'success');
            log('[LOGIN RESPONSE ✅]', 'success');
            log('═'.repeat(50), 'success');
            broadcast('status', { ws: true, login: true, auth: false });
            return;
        }

        // Auth Confirm
        if (rh === 'AUA') {
            log('═'.repeat(50), 'success');
            log('[AUTH CONFIRMED ✅] Sending ST reply...', 'success');
            log('═'.repeat(50), 'success');
            gameWs.send(SETTINGS.AUTH_CONFIRM_REPLY);
            broadcast('sent', { message: SETTINGS.AUTH_CONFIRM_REPLY, rh: 'st' });
            broadcast('status', { ws: true, login: true, auth: true });
            return;
        }

        log(`[SERVER] RH=${rh}`, 'received');
    });

    gameWs.on('error', (error) => {
        log(`[WS ERROR] ${error.message}`, 'error');
    });

    gameWs.on('close', (code, reason) => {
        log('═'.repeat(50), 'error');
        log('[WS CLOSED ❌]', 'error');
        log(`Code: ${code}`, 'error');
        log(`Reason: ${reason || 'No reason'}`, 'error');
        log('═'.repeat(50), 'error');
        broadcast('status', { ws: false, login: false, auth: false });
        gameWs = null;
    });
}

// =========================
// HTTP ROUTES
// =========================

// Get current settings
app.get('/api/settings', (req, res) => {
    res.json({
        success: true,
        settings: SETTINGS
    });
});

// Save settings
app.post('/api/settings', (req, res) => {
    const newSettings = req.body;
    
    // Validate required fields
    if (!newSettings.USERGET_PAYLOAD || !newSettings.JO_PAYLOAD) {
        return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Update settings
    SETTINGS = { ...SETTINGS, ...newSettings };
    
    // Save to file
    if (saveSettings(SETTINGS)) {
        log('[SETTINGS] Settings saved successfully ✅', 'success');
        broadcast('settings_updated', SETTINGS);
        res.json({ success: true, message: 'Settings saved' });
    } else {
        res.json({ success: false, message: 'Failed to save settings' });
    }
});

// Reset to default settings
app.post('/api/settings/reset', (req, res) => {
    SETTINGS = { ...DEFAULT_SETTINGS };
    
    if (saveSettings(SETTINGS)) {
        log('[SETTINGS] Reset to defaults ✅', 'success');
        broadcast('settings_updated', SETTINGS);
        res.json({ success: true, message: 'Settings reset to defaults', settings: SETTINGS });
    } else {
        res.json({ success: false, message: 'Failed to reset settings' });
    }
});

app.post('/api/start', async (req, res) => {
    if (gameWs && gameWs.readyState === WebSocket.OPEN) {
        return res.json({ success: false, message: 'Already connected' });
    }

    // Reload settings before connecting
    SETTINGS = loadSettings();
    log('[SETTINGS] Reloaded settings before connection', 'info');

    const userGetSuccess = await doUserGet();
    if (!userGetSuccess) {
        return res.json({ success: false, message: 'UserGet failed' });
    }

    setTimeout(() => {
        connectGameWs();
    }, 300);

    res.json({ success: true, message: 'Starting...' });
});

app.post('/api/disconnect', (req, res) => {
    if (gameWs) {
        gameWs.close();
        gameWs = null;
    }
    res.json({ success: true, message: 'Disconnected' });
});

app.post('/api/send', (req, res) => {
    const { message } = req.body;
    
    if (!gameWs || gameWs.readyState !== WebSocket.OPEN) {
        return res.json({ success: false, message: 'Not connected' });
    }

    try {
        gameWs.send(message);
        const rh = getRH(message);
        broadcast('sent', { message, rh });
        log(`[SENT] Custom message (RH=${rh})`, 'sent');
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        connected: gameWs && gameWs.readyState === WebSocket.OPEN
    });
});
app.get("/", (req, res) => {
    res.send("Ludo Star Client is running ✅");
});
// =========================
// CLIENT WEBSOCKET SERVER
// =========================
const server = app.listen(PORT, () => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🎲 Ludo Star Client Server`);
    console.log(`${'═'.repeat(50)}`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`⚙️  Settings: ${SETTINGS_FILE}`);
    console.log(`${'═'.repeat(50)}\n`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('[CLIENT] Browser connected');
    
    // Send current status and settings
    ws.send(JSON.stringify({
        type: 'init',
        data: {
            status: {
                ws: gameWs && gameWs.readyState === WebSocket.OPEN,
                login: false,
                auth: false
            },
            settings: SETTINGS
        },
        timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log('[CLIENT] Browser disconnected');
    });
});
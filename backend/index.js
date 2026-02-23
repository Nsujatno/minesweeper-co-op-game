'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const lobbyRouter = require('./src/routes/lobby');
const { registerSocketHandlers } = require('./src/socketHandlers');
const { allLobbies, deleteLobby } = require('./src/lobbyStore');

// ─── Express setup ───────────────────────────────────────────────────────────
const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'MineSweep Together API' }));

// REST routes
app.use('/lobby', lobbyRouter);

// ─── HTTP + Socket.io setup ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log(`[socket] connected  ${socket.id}`);
    registerSocketHandlers(io, socket);
});

// ─── Lobby cleanup job ───────────────────────────────────────────────────────
// Runs every 5 minutes; removes lobbies that are:
//   - older than 2 hours, OR
//   - finished for more than 10 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;   // 5 min
const MAX_LOBBY_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_FINISHED_AGE_MS = 10 * 60 * 1000;      // 10 min

setInterval(() => {
    const now = Date.now();
    let removed = 0;

    for (const [code, lobby] of allLobbies()) {
        const tooOld = now - lobby.createdAt > MAX_LOBBY_AGE_MS;
        const finishedTooLong =
            lobby.status === 'finished' &&
            lobby.finishedAt &&
            now - lobby.finishedAt > MAX_FINISHED_AGE_MS;

        if (tooOld || finishedTooLong) {
            deleteLobby(code);
            removed++;
        }
    }

    if (removed > 0) console.log(`[cleanup] removed ${removed} stale lobby/lobbies`);
}, CLEANUP_INTERVAL_MS);

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
'use strict';

const { Router } = require('express');
const { createLobby, getLobby } = require('../lobbyStore');

const router = Router();

/**
 * POST /lobby/create
 * Body: { name: string }
 * Creates a new lobby and returns the invite code.
 * A placeholder socketId is used here; the player must still connect via Socket.io.
 */
router.post('/create', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' });
    }
    // Use a placeholder socketId — replaced when the socket connects and emits lobby:join
    const lobby = createLobby('__rest__', name.trim());
    return res.status(201).json({ code: lobby.code });
});

/**
 * POST /lobby/join
 * Body: { code: string, name: string }
 * Validates the lobby exists, isn't full, and isn't finished.
 */
router.post('/join', (req, res) => {
    const { code, name } = req.body;
    if (!code || !name) {
        return res.status(400).json({ error: 'code and name are required' });
    }

    const lobby = getLobby(code.toUpperCase());
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }
    if (lobby.status === 'finished') {
        return res.status(409).json({ error: 'Game already finished' });
    }
    if (lobby.players.length >= 4) {
        return res.status(409).json({ error: 'Lobby is full' });
    }

    return res.status(200).json({ ok: true, status: lobby.status });
});

module.exports = router;

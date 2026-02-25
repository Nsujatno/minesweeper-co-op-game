'use strict';

const lobbies = new Map();

// Player colors assigned in join order — names must match the frontend colorToBg() map
const PLAYER_COLORS = ['coral', 'teal', 'purple', 'yellow'];

/**
 * Generate a random 4-character alphanumeric code.
 * Retries if the code already exists.
 */
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (lobbies.has(code));
    return code;
}

/**
 * Create a new lobby. Returns the lobby object.
 */
function createLobby(hostSocketId, hostName) {
    const code = generateCode();
    const hostColor = PLAYER_COLORS[0];
    const lobby = {
        code,
        status: 'waiting',
        players: [{ socketId: hostSocketId, name: hostName, color: hostColor }],
        board: null,
        startedAt: null,
        createdAt: Date.now(),
        hostSocketId,
    };
    lobbies.set(code, lobby);
    return lobby;
}

/**
 * Get a lobby by code. Returns null if not found.
 */
function getLobby(code) {
    return lobbies.get(code) ?? null;
}

/**
 * Delete a lobby by code.
 */
function deleteLobby(code) {
    lobbies.delete(code);
}

/**
 * Add a player to an existing lobby.
 * Returns the updated lobby or null if lobby not found.
 */
function addPlayer(code, { socketId, name }) {
    const lobby = lobbies.get(code);
    if (!lobby) return null;
    const color = PLAYER_COLORS[lobby.players.length] ?? '#6B7280';
    lobby.players.push({ socketId, name, color });
    return lobby;
}

/**
 * Remove a player by their socketId.
 * Deletes the lobby if it becomes empty.
 * Returns { code, lobby } or null if the player wasn't in any lobby.
 */
function removePlayer(socketId) {
    for (const [code, lobby] of lobbies) {
        const idx = lobby.players.findIndex((p) => p.socketId === socketId);
        if (idx !== -1) {
            lobby.players.splice(idx, 1);
            if (lobby.players.length === 0) {
                // Only delete immediately if the game hasn't started yet.
                // If a game is in progress, keep the lobby alive — players may
                // reconnect (e.g. navigating from lobby → game page creates a
                // new socket and rejoins). The cleanup job will eventually
                // remove it.
                if (lobby.status === 'waiting') {
                    lobbies.delete(code);
                    return { code, lobby: null };
                }
                return { code, lobby };
            }
            // If the host left, assign the next player as host
            if (lobby.hostSocketId === socketId) {
                lobby.hostSocketId = lobby.players[0].socketId;
            }
            return { code, lobby };
        }
    }
    return null;
}

/**
 * Return all lobbies as an iterable of [code, lobby] pairs.
 */
function allLobbies() {
    return lobbies.entries();
}

module.exports = { createLobby, getLobby, deleteLobby, addPlayer, removePlayer, allLobbies };

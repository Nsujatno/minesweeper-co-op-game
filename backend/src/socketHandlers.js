'use strict';

const { getLobby, addPlayer, removePlayer } = require('./lobbyStore');
const { generateBoard, revealCell, toggleFlag, checkWin, maskBoard } = require('./boardEngine');

/**
 * Register all Socket.io event handlers for a connected socket.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerSocketHandlers(io, socket) {
    // ─── lobby:join ──────────────────────────────────────────────────────────
    // Payload: { code, name }
    socket.on('lobby:join', ({ code, name } = {}) => {
        if (!code || !name) return;
        const upperCode = code.toUpperCase();

        let lobby = getLobby(upperCode);
        if (!lobby) return socket.emit('error', { message: 'Lobby not found' });
        if (lobby.status === 'finished') return socket.emit('error', { message: 'Game already finished' });
        if (lobby.players.length >= 4 && !lobby.players.find((p) => p.socketId === socket.id)) {
            return socket.emit('error', { message: 'Lobby is full' });
        }

        // If the lobby was created via REST (host placeholder), replace the placeholder
        const existingPlayer = lobby.players.find((p) => p.socketId === socket.id);
        if (!existingPlayer) {
            // Check for REST-created host slot to claim
            const restSlot = lobby.players.find((p) => p.socketId === '__rest__');
            if (restSlot) {
                restSlot.socketId = socket.id;
                lobby.hostSocketId = socket.id;
            } else {
                lobby = addPlayer(upperCode, { socketId: socket.id, name });
                if (!lobby) return socket.emit('error', { message: 'Lobby not found' });
            }
        }

        socket.join(upperCode);

        // Send the current state back to the joining player
        socket.emit('lobby:state', {
            code: upperCode,
            players: lobby.players.map(({ name, color }) => ({ name, color })),
            status: lobby.status,
            isHost: lobby.hostSocketId === socket.id,
        });

        // If the game is already in progress, send the current board to the joining player
        if (lobby.status === 'playing' && lobby.board) {
            socket.emit('board:update', {
                board: maskBoard(lobby.board),
                startedAt: lobby.startedAt,
            });
        }

        // Broadcast updated player list to everyone in the room
        io.to(upperCode).emit('player:joined', {
            players: lobby.players.map(({ name, color }) => ({ name, color })),
        });
    });

    // ─── game:start ──────────────────────────────────────────────────────────
    // Only the host may start; requires ≥ 2 players
    socket.on('game:start', ({ code } = {}) => {
        const lobby = getLobby(code?.toUpperCase());
        if (!lobby) return socket.emit('error', { message: 'Lobby not found' });
        if (lobby.hostSocketId !== socket.id) return socket.emit('error', { message: 'Only the host can start the game' });
        if (lobby.players.length < 2) return socket.emit('error', { message: 'Need at least 2 players to start' });
        if (lobby.status !== 'waiting') return socket.emit('error', { message: 'Game already started' });

        lobby.board = generateBoard();
        lobby.status = 'playing';
        lobby.startedAt = null; // timer starts on first cell reveal

        io.to(lobby.code).emit('game:start', {
            board: maskBoard(lobby.board),
            startedAt: null,
            players: lobby.players.map(({ name, color }) => ({ name, color })),
        });
    });

    // ─── cell:reveal ─────────────────────────────────────────────────────────
    // Payload: { code, row, col }
    socket.on('cell:reveal', ({ code, row, col } = {}) => {
        const lobby = getLobby(code?.toUpperCase());
        if (!lobby || lobby.status !== 'playing' || !lobby.board) return;

        const { board, hit } = revealCell(lobby.board, row, col);
        lobby.board = board;

        // Start timer on first reveal
        if (!lobby.startedAt) lobby.startedAt = Date.now();

        if (hit) {
            lobby.status = 'finished';
            lobby.finishedAt = Date.now();
            io.to(lobby.code).emit('board:update', {
                board: maskBoard(lobby.board),
                startedAt: lobby.startedAt,
            });
            io.to(lobby.code).emit('game:over', {
                result: 'loss',
                time: Date.now() - lobby.startedAt,
            });
            return;
        }

        const won = checkWin(lobby.board);
        if (won) {
            lobby.status = 'finished';
            lobby.finishedAt = Date.now();
            io.to(lobby.code).emit('board:update', {
                board: maskBoard(lobby.board),
                startedAt: lobby.startedAt,
            });
            io.to(lobby.code).emit('game:over', {
                result: 'win',
                time: Date.now() - lobby.startedAt,
            });
            return;
        }

        io.to(lobby.code).emit('board:update', {
            board: maskBoard(lobby.board),
            startedAt: lobby.startedAt,
        });
    });

    // ─── cell:flag ───────────────────────────────────────────────────────────
    // Payload: { code, row, col }
    socket.on('cell:flag', ({ code, row, col } = {}) => {
        const lobby = getLobby(code?.toUpperCase());
        if (!lobby || lobby.status !== 'playing' || !lobby.board) return;

        lobby.board = toggleFlag(lobby.board, row, col);

        io.to(lobby.code).emit('board:update', {
            board: maskBoard(lobby.board),
            startedAt: lobby.startedAt,
        });
    });

    // ─── cursor:move ─────────────────────────────────────────────────────────
    // Payload: { code, x, y }
    socket.on('cursor:move', ({ code, x, y } = {}) => {
        const lobby = getLobby(code?.toUpperCase());
        if (!lobby) return;

        const player = lobby.players.find((p) => p.socketId === socket.id);
        if (!player) return;

        // Broadcast to everyone in the room EXCEPT the sender
        socket.to(lobby.code).emit('cursor:broadcast', {
            socketId: socket.id,
            name: player.name,
            color: player.color,
            x,
            y,
        });
    });

    // ─── disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        const result = removePlayer(socket.id);
        if (!result) return; // player wasn't in any lobby

        const { code, lobby } = result;
        if (!lobby) return; // lobby was deleted (was empty)

        io.to(code).emit('player:left', {
            players: lobby.players.map(({ name, color }) => ({ name, color })),
        });
    });
}

module.exports = { registerSocketHandlers };

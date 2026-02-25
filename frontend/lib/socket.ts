/**
 * Singleton Socket.io client.
 *
 * Creates the socket once and reuses it across page navigations.
 * This is critical: if each page creates its own socket, navigating from
 * /lobby → /game disconnects the old socket and fires removePlayer on the
 * server, potentially deleting the lobby before the game page reconnects.
 *
 * Import { getSocket, disconnectSocket } anywhere in the frontend.
 */

import { io, Socket } from "socket.io-client";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket || socket.disconnected) {
        socket = io(BACKEND_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });
    }
    return socket;
}

/** Call this only when you truly want to leave (e.g. the game is over). */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

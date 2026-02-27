"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSocket, disconnectSocket } from "@/lib/socket";

import GameHUD from "@/components/game/GameHUD";
import MinesweeperBoard from "@/components/game/MinesweeperBoard";
import GameOverOverlay from "@/components/game/GameOverOverlay";
import { CellData } from "@/components/game/MineCell";


interface Player {
    name: string;
    color: string;
}

interface RemoteCursor {
    socketId: string;
    name: string;
    color: string;
    x: number;
    y: number;
}

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const rawCode = Array.isArray(params?.code) ? params.code[0] : params?.code;
    const lobbyCode = (rawCode ?? "???").toUpperCase();

    const cursorThrottleRef = useRef<number>(0);

    const [board, setBoard] = useState<CellData[][]>([]);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [cursors, setCursors] = useState<RemoteCursor[]>([]);
    const [gameResult, setGameResult] = useState<"win" | "loss" | null>(null);
    const [finalTime, setFinalTime] = useState(0);
    const [mineCount, setMineCount] = useState(40);

    const flagCount = board.flat().filter((c) => c.flagged).length;
    const minesLeft = mineCount - flagCount;
    const isGameOver = gameResult !== null;
    // Derive aspect ratio from actual board dimensions so it's always correct
    const boardCols = board[0]?.length ?? 16;
    const boardRows = board.length ?? 16;

    useEffect(() => {
        const socket = getSocket();
        const storedName = sessionStorage.getItem("playerName") ?? "Player";

        // ── Named handlers — allows targeted socket.off() ─────────────────────
        const onLobbyState = ({ players: p, status }: { players: Player[]; status: string }) => {
            setPlayers(p);
            if (status === "waiting") router.replace(`/lobby/${lobbyCode}`);
        };

        const onGameStart = ({ board: b, players: p, mineCount: mc }: { board: CellData[][]; players: Player[]; mineCount?: number }) => {
            setBoard(b);
            setPlayers(p);
            setStartedAt(null);
            if (mc != null) setMineCount(mc);
            // Dismiss the overlay if this player didn't click Play Again
            setGameResult(null);
            setCursors([]);
        };



        const onBoardUpdate = ({ board: b, startedAt: sa }: { board: CellData[][]; startedAt: number | null }) => {
            setBoard(b);
            if (sa) setStartedAt(sa);
        };

        const onGameOver = ({ result, time }: { result: "win" | "loss"; time: number }) => {
            setGameResult(result);
            setFinalTime(time);
        };

        const onPlayerJoined = ({ players: p }: { players: Player[] }) => setPlayers(p);
        const onPlayerLeft = ({ players: p }: { players: Player[] }) => setPlayers(p);

        const onCursorBroadcast = (data: RemoteCursor) => {
            setCursors((prev) => [...prev.filter((c) => c.socketId !== data.socketId), data]);
        };

        const onConnect = () => {
            socket.emit("lobby:join", { code: lobbyCode, name: storedName });
        };

        // Register all listeners before emitting so we never miss a response
        socket.on("lobby:state", onLobbyState);
        socket.on("game:start", onGameStart);
        socket.on("board:update", onBoardUpdate);
        socket.on("game:over", onGameOver);
        socket.on("player:joined", onPlayerJoined);
        socket.on("player:left", onPlayerLeft);
        socket.on("cursor:broadcast", onCursorBroadcast);
        socket.on("connect", onConnect);

        if (socket.connected) {
            socket.emit("lobby:join", { code: lobbyCode, name: storedName });
        }

        return () => {
            socket.off("lobby:state", onLobbyState);
            socket.off("game:start", onGameStart);
            socket.off("board:update", onBoardUpdate);
            socket.off("game:over", onGameOver);
            socket.off("player:joined", onPlayerJoined);
            socket.off("player:left", onPlayerLeft);
            socket.off("cursor:broadcast", onCursorBroadcast);
            socket.off("connect", onConnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lobbyCode]);

    const handleReveal = useCallback((row: number, col: number) => {
        getSocket().emit("cell:reveal", { code: lobbyCode, row, col });
    }, [lobbyCode]);

    const handleFlag = useCallback((row: number, col: number) => {
        getSocket().emit("cell:flag", { code: lobbyCode, row, col });
    }, [lobbyCode]);

    const handleCursorMove = useCallback((x: number, y: number) => {
        const now = Date.now();
        if (now - cursorThrottleRef.current < 30) return;
        cursorThrottleRef.current = now;
        getSocket().emit("cursor:move", { code: lobbyCode, x, y });
    }, [lobbyCode]);

    const handleGoHome = () => {
        disconnectSocket();
        router.push("/");
    };

    return (
        <main className="h-screen overflow-hidden flex flex-col items-center px-4 pt-2 pb-3 gap-2">

            {/* HUD — contains back button + mine counter + timer + players */}
            <div className="w-full max-w-5xl flex-shrink-0">
                <GameHUD
                    minesLeft={minesLeft}
                    startedAt={startedAt}
                    players={players}
                    lobbyCode={lobbyCode}
                    onGoHome={handleGoHome}
                />
            </div>

            {/* Board — square, constrained by available height */}
            <div className="flex-1 min-h-0 w-full flex justify-center">
                <motion.div
                    style={{
                        height: "100%",
                        aspectRatio: `${boardCols} / ${boardRows}`,
                        maxWidth: "100%",
                    }}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.35, delay: 0.1 }}
                >
                    <MinesweeperBoard
                        board={board}
                        onReveal={handleReveal}
                        onFlag={handleFlag}
                        onCursorMove={handleCursorMove}
                        cursors={cursors}
                        isGameOver={isGameOver}
                    />
                </motion.div>
            </div>

            <GameOverOverlay result={gameResult} timeMs={finalTime} lobbyCode={lobbyCode} />
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Player {
    name: string;
    color: string;
}

interface GameHUDProps {
    minesLeft: number;
    startedAt: number | null;
    players: Player[];
    lobbyCode: string;
}

function formatTime(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Map server color strings to Tailwind-compatible bg styles
function colorToBg(color: string): string {
    const map: Record<string, string> = {
        coral: "#FF6B6B",
        teal: "#4ECDC4",
        yellow: "#FFE66D",
        purple: "#A593E0",
    };
    return map[color] ?? color;
}

export default function GameHUD({ minesLeft, startedAt, players, lobbyCode }: GameHUDProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startedAt) return;
        const tick = () => setElapsed(Date.now() - startedAt);
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    return (
        <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.45 }}
            className="w-full bg-[#FFE66D] border-4 border-b-8 border-[#2C2C2C] rounded-3xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        >
            {/* Mine counter */}
            <div className="flex items-center gap-2">
                <div className="bg-white border-4 border-[#2C2C2C] rounded-2xl px-4 py-2 flex items-center gap-2 min-w-[80px] justify-center">
                    <span className="text-xl">💣</span>
                    <span className="font-heading font-black text-2xl text-[#2C2C2C]">
                        {minesLeft}
                    </span>
                </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
                <div className="bg-white border-4 border-[#2C2C2C] rounded-2xl px-4 py-2 flex items-center gap-2 min-w-[100px] justify-center">
                    <span className="text-xl">⏱</span>
                    <span className="font-heading font-black text-2xl text-[#2C2C2C] tabular-nums">
                        {startedAt ? formatTime(elapsed) : "00:00"}
                    </span>
                </div>
            </div>

            {/* Players & lobby code */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                    {players.map((p) => (
                        <div
                            key={p.name}
                            title={p.name}
                            style={{ backgroundColor: colorToBg(p.color) }}
                            className="w-8 h-8 rounded-full border-2 border-[#2C2C2C] flex items-center justify-center font-heading font-black text-sm text-[#2C2C2C]"
                        >
                            {p.name[0].toUpperCase()}
                        </div>
                    ))}
                </div>
                <div className="bg-[#2C2C2C] text-white font-heading font-black text-sm px-3 py-1 rounded-full tracking-widest">
                    {lobbyCode}
                </div>
            </div>
        </motion.div>
    );
}

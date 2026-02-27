"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "@/components/ActionButton";
import { useRouter } from "next/navigation";

interface GameOverOverlayProps {
    result: "win" | "loss" | null;
    timeMs: number;
    lobbyCode: string;
}

function formatTime(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function GameOverOverlay({ result, timeMs, lobbyCode }: GameOverOverlayProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleShareTime = async () => {
        const text = `💣 I cleared MineSweep Together in ${formatTime(timeMs)}! Can you beat my time? minesweeptogether.com`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <AnimatePresence>
            {result && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#2C2C2C]/60 backdrop-blur-sm" />

                    <motion.div
                        className={`relative w-full max-w-sm p-8 border-4 border-b-8 border-[#2C2C2C] rounded-3xl flex flex-col items-center gap-5 text-center ${result === "win"
                            ? "bg-[#4ECDC4]"
                            : "bg-[#FF6B6B]"
                            }`}
                        initial={{ y: 100, scale: 0.85, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 80, scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                    >
                        {/* Big emoji */}
                        <motion.div
                            className="text-7xl"
                            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            {result === "win" ? "🎉" : "💥"}
                        </motion.div>

                        {/* Title */}
                        <h2 className="font-heading text-5xl font-black text-[#2C2C2C]">
                            {result === "win" ? "You Win!" : "Boom!"}
                        </h2>

                        {/* Subtitle */}
                        <p className="font-sans font-bold text-[#2C2C2C]/80 text-lg">
                            {result === "win"
                                ? "Amazing teamwork! 🤝"
                                : "A mine was triggered 💣"}
                        </p>

                        {/* Time */}
                        <div className="bg-white border-4 border-[#2C2C2C] rounded-2xl px-8 py-3 flex items-center gap-3">
                            <span className="text-2xl">⏱</span>
                            <span className="font-heading font-black text-3xl text-[#2C2C2C] tabular-nums">
                                {formatTime(timeMs)}
                            </span>
                        </div>

                        {/* Share time — win only */}
                        {result === "win" && (
                            <button
                                onClick={handleShareTime}
                                className="w-full bg-[#FFE66D] border-4 border-b-6 border-[#2C2C2C] rounded-2xl py-3 px-6 font-heading font-black text-[#2C2C2C] text-lg hover:bg-[#ffd93d] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? "✓ Copied to clipboard!" : "🔗 Share my time"}
                            </button>
                        )}

                        {/* Play Again — goes back to same lobby */}
                        <ActionButton
                            variant="create"
                            label="Play Again 🚀"
                            onClick={() => router.push(`/lobby/${lobbyCode}`)}
                            className="w-full"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

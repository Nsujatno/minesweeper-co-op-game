"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
    id: string;
    name: string;
    color: string; // e.g. "coral" | "teal" | "yellow" | "purple"
    text: string;
    timestamp: number;
    isSelf: boolean;
}

interface ChatBentoProps {
    messages: ChatMessage[];
    onSend: (text: string) => void;
}

const COLOR_DOT: Record<string, string> = {
    coral: "bg-[#FF6B6B]",
    teal: "bg-[#4ECDC4]",
    yellow: "bg-[#FFE66D]",
    purple: "bg-[#A593E0]",
};

const COLOR_BUBBLE: Record<string, string> = {
    coral: "bg-[#FF6B6B]/15 border-[#FF6B6B]/40",
    teal: "bg-[#4ECDC4]/15 border-[#4ECDC4]/40",
    yellow: "bg-[#FFE66D]/20 border-[#FFE66D]/60",
    purple: "bg-[#A593E0]/15 border-[#A593E0]/40",
};

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBento({ messages, onSend }: ChatBentoProps) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom whenever a new message arrives
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div className="bg-[#FAF8F5] border-4 border-b-8 border-[#2C2C2C] rounded-3xl p-6 flex flex-col gap-4 h-64 md:h-72">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <h3 className="font-heading text-2xl font-black text-[#2C2C2C] flex items-center gap-2">
                    💬 Chat
                </h3>
                <span className="font-sans font-bold text-[#2C2C2C]/40 text-xs uppercase tracking-widest">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-0 scrollbar-thin scrollbar-thumb-[#2C2C2C]/10">
                {messages.length === 0 && (
                    <p className="font-sans text-sm text-[#2C2C2C]/30 text-center my-auto">
                        No messages yet — say hi! 👋
                    </p>
                )}
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex items-end gap-2 ${msg.isSelf ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Color dot */}
                            <div
                                className={`w-3 h-3 rounded-full shrink-0 mb-1 border-2 border-[#2C2C2C] ${COLOR_DOT[msg.color] ?? "bg-[#A593E0]"
                                    }`}
                            />
                            {/* Bubble */}
                            <div
                                className={`max-w-[75%] px-3 py-2 rounded-2xl border-2 ${msg.isSelf
                                        ? "bg-[#2C2C2C] border-[#2C2C2C] text-white rounded-br-sm"
                                        : `${COLOR_BUBBLE[msg.color] ?? "bg-[#A593E0]/15 border-[#A593E0]/40"} text-[#2C2C2C] rounded-bl-sm`
                                    }`}
                            >
                                {!msg.isSelf && (
                                    <p className="font-heading font-black text-[11px] leading-none mb-1 opacity-60">
                                        {msg.name}
                                    </p>
                                )}
                                <p className="font-sans text-sm leading-snug break-words">{msg.text}</p>
                                <p
                                    className={`font-sans text-[10px] mt-1 text-right leading-none ${msg.isSelf ? "text-white/40" : "text-[#2C2C2C]/30"
                                        }`}
                                >
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={200}
                    placeholder="Say something…"
                    className="flex-1 bg-white border-4 border-[#2C2C2C] rounded-2xl px-4 py-2 font-sans text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/30 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] transition-shadow"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-[#2C2C2C] text-white font-heading font-black text-sm px-5 py-2 rounded-2xl border-4 border-b-[6px] border-[#2C2C2C] active:border-b-[2px] active:translate-y-[2px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

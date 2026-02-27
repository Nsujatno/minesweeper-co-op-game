"use client";

import { motion } from "framer-motion";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultyOption {
    key: Difficulty;
    label: string;
    grid: string;
    mines: number;
    selectedBg: string;
    selectedText: string;
}

const OPTIONS: DifficultyOption[] = [
    { key: "easy", label: "Easy", grid: "9×9", mines: 10, selectedBg: "bg-[#4ECDC4]", selectedText: "text-[#2C2C2C]" },
    { key: "medium", label: "Medium", grid: "16×16", mines: 40, selectedBg: "bg-[#FFE66D]", selectedText: "text-[#2C2C2C]" },
    { key: "hard", label: "Hard", grid: "20×20", mines: 80, selectedBg: "bg-[#FF6B6B]", selectedText: "text-white" },
];

interface DifficultyBentoProps {
    selected: Difficulty;
    isHost: boolean;
    onSelect: (d: Difficulty) => void;
}

export default function DifficultyBento({ selected, isHost, onSelect }: DifficultyBentoProps) {
    return (
        <div className="bg-[#FAF8F5] border-4 border-b-8 border-[#2C2C2C] rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-[#2C2C2C]/70 uppercase tracking-widest text-xs">
                    Difficulty
                </h3>
                {!isHost && (
                    <span className="text-[10px] font-bold font-sans text-[#2C2C2C]/30 uppercase tracking-wide">
                        Host only
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                {OPTIONS.map((opt) => {
                    const isSelected = selected === opt.key;
                    return (
                        <motion.button
                            key={opt.key}
                            onClick={() => isHost && onSelect(opt.key)}
                            disabled={!isHost}
                            whileHover={isHost && !isSelected ? { scale: 1.03 } : {}}
                            whileTap={isHost ? { scale: 0.97 } : {}}
                            className={`
                flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-4 border-b-[6px] transition-all duration-150
                ${isSelected
                                    ? `${opt.selectedBg} border-[#2C2C2C] ${opt.selectedText}`
                                    : "bg-white border-[#2C2C2C]/15 text-[#2C2C2C]/40"
                                }
                ${isHost ? "cursor-pointer" : "cursor-default"}
              `}
                        >
                            <span className={`font-heading font-black text-sm ${isSelected ? "" : "opacity-50"}`}>
                                {opt.label}
                            </span>
                            <div className={`flex flex-col items-center gap-0.5 ${isSelected ? "opacity-80" : "opacity-40"}`}>
                                <span className="font-sans font-bold text-[10px] leading-none">{opt.grid}</span>
                                <span className="font-sans text-[10px] leading-none">{opt.mines} mines</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

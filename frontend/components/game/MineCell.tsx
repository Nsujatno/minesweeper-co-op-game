"use client";

import { motion } from "framer-motion";

export interface CellData {
    revealed: boolean;
    flagged: boolean;
    adjacentMines: number;
    mine?: boolean;
}

interface MineCellProps {
    cell: CellData;
    row: number;
    col: number;
    onReveal: (row: number, col: number) => void;
    onFlag: (row: number, col: number) => void;
    isGameOver: boolean;
}

// Minesweeper number colors mapped to theme palette
const NUMBER_COLORS: Record<number, string> = {
    1: "text-blue-600",
    2: "text-green-600",
    3: "text-[#FF6B6B]",
    4: "text-purple-700",
    5: "text-red-800",
    6: "text-[#4ECDC4]",
    7: "text-black",
    8: "text-gray-500",
};

export default function MineCell({
    cell,
    row,
    col,
    onReveal,
    onFlag,
    isGameOver,
}: MineCellProps) {
    const handleClick = () => {
        if (cell.revealed || cell.flagged || isGameOver) return;
        onReveal(row, col);
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cell.revealed || isGameOver) return;
        onFlag(row, col);
    };

    // Revealed mine (game over)
    if (cell.revealed && cell.mine) {
        return (
            <motion.div
                initial={{ scale: 1.4, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="w-full h-full bg-[#FF6B6B] border-2 border-[#2C2C2C] rounded-md flex items-center justify-center text-base sm:text-lg select-none"
            >
                💣
            </motion.div>
        );
    }

    // Flagged
    if (cell.flagged) {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onContextMenu={handleRightClick}
                className="w-full h-full bg-[#FFE66D] border-2 border-b-4 border-[#2C2C2C] rounded-md flex items-center justify-center text-base sm:text-lg cursor-pointer select-none"
            >
                🚩
            </motion.div>
        );
    }

    // Revealed number cell
    if (cell.revealed && cell.adjacentMines > 0) {
        return (
            <div className="w-full h-full bg-white border-2 border-[#2C2C2C]/30 rounded-md flex items-center justify-center select-none">
                <span
                    className={`font-heading font-black text-sm sm:text-base ${NUMBER_COLORS[cell.adjacentMines] ?? "text-[#2C2C2C]"}`}
                >
                    {cell.adjacentMines}
                </span>
            </div>
        );
    }

    // Revealed empty cell
    if (cell.revealed) {
        return (
            <div className="w-full h-full bg-[#FAF8F5] border border-[#2C2C2C]/10 rounded-md" />
        );
    }

    // Hidden (default)
    return (
        <motion.div
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.93, y: 2 }}
            onClick={handleClick}
            onContextMenu={handleRightClick}
            className="w-full h-full bg-[#FAF8F5] border-2 border-b-4 border-[#2C2C2C] rounded-md cursor-pointer select-none hover:bg-white transition-colors"
        />
    );
}

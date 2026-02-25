"use client";

import { useRef } from "react";
import MineCell, { CellData } from "./MineCell";
import CursorLayer from "./CursorLayer";

interface RemoteCursor {
    socketId: string;
    name: string;
    color: string;
    x: number;
    y: number;
}

interface MinesweeperBoardProps {
    board: CellData[][];
    onReveal: (row: number, col: number) => void;
    onFlag: (row: number, col: number) => void;
    onCursorMove: (x: number, y: number) => void;
    cursors: RemoteCursor[];
    isGameOver: boolean;
}

export default function MinesweeperBoard({
    board,
    onReveal,
    onFlag,
    onCursorMove,
    cursors,
    isGameOver,
}: MinesweeperBoardProps) {
    const boardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!boardRef.current) return;
        const rect = boardRef.current.getBoundingClientRect();
        onCursorMove(e.clientX - rect.left, e.clientY - rect.top);
    };

    if (!board || board.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#2C2C2C]/50 font-heading text-2xl">
                Loading board…
            </div>
        );
    }

    const rows = board.length;
    const cols = board[0].length;

    return (
        <div
            ref={boardRef}
            onMouseMove={handleMouseMove}
            onContextMenu={(e) => e.preventDefault()}
            className="relative h-full bg-[#FAF8F5] border-4 border-b-8 border-[#2C2C2C] rounded-3xl p-2 overflow-hidden"
            style={{ touchAction: "none" }}
        >
            <div
                className="grid h-full gap-[2px]"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            className="min-w-0 min-h-0"
                        >
                            <MineCell
                                cell={cell}
                                row={r}
                                col={c}
                                onReveal={onReveal}
                                onFlag={onFlag}
                                isGameOver={isGameOver}
                            />
                        </div>
                    ))
                )}
            </div>

            <CursorLayer cursors={cursors} />
        </div>
    );
}

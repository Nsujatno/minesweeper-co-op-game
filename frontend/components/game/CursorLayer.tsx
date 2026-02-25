"use client";

interface RemoteCursor {
    socketId: string;
    name: string;
    color: string;
    x: number;
    y: number;
}

function colorToBg(color: string): string {
    const map: Record<string, string> = {
        coral: "#FF6B6B",
        teal: "#4ECDC4",
        yellow: "#FFE66D",
        purple: "#A593E0",
    };
    return map[color] ?? color;
}

interface CursorLayerProps {
    cursors: RemoteCursor[];
}

export default function CursorLayer({ cursors }: CursorLayerProps) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {cursors.map((cursor) => (
                <div
                    key={cursor.socketId}
                    className="absolute transition-transform duration-75"
                    style={{ left: cursor.x, top: cursor.y, transform: "translate(-4px, -4px)" }}
                >
                    {/* Cursor arrow */}
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <path
                            d="M2 2L18 10L10 12L6 20L2 2Z"
                            fill={colorToBg(cursor.color)}
                            stroke="#2C2C2C"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {/* Name tag */}
                    <div
                        className="mt-1 px-2 py-0.5 rounded-full border-2 border-[#2C2C2C] font-heading font-bold text-xs text-[#2C2C2C] whitespace-nowrap"
                        style={{ backgroundColor: colorToBg(cursor.color) }}
                    >
                        {cursor.name}
                    </div>
                </div>
            ))}
        </div>
    );
}

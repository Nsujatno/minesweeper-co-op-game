"use client";

import { motion } from "framer-motion";

interface PlayerListBentoProps {
  players: { name: string; colorClass: string }[];
}

// Fixed grid of 4 slots for max 4 players
const MAX_PLAYERS = 4;

export default function PlayerListBento({ players }: PlayerListBentoProps) {
  const slots = Array.from({ length: MAX_PLAYERS }, (_, i) => players[i] || null);

  return (
    <div className="bg-[#FAF8F5] p-6 border-4 border-b-8 border-[#2C2C2C] rounded-3xl h-full flex flex-col">
      <h2 className="font-heading text-2xl font-black mb-6 text-[#2C2C2C] flex items-center justify-between">
        <span>Players</span>
        <span className="bg-[#2C2C2C] text-white text-sm px-3 py-1 rounded-full">
          {players.length}/{MAX_PLAYERS}
        </span>
      </h2>
      
      <div className="flex flex-col gap-4 flex-1 justify-center">
        {slots.map((player, index) => (
          <motion.div
            key={index}
            initial={player ? { opacity: 0, x: -20 } : false}
            animate={player ? { opacity: 1, x: 0 } : false}
            transition={{ type: "spring", bounce: 0.5, delay: index * 0.1 }}
            className={`p-4 border-4 border-[#2C2C2C] rounded-2xl flex items-center gap-4 transition-colors ${
              player ? player.colorClass : "bg-black/5 border-dashed"
            }`}
          >
            <div className={`w-10 h-10 rounded-full border-4 border-[#2C2C2C] bg-white flex items-center justify-center text-xl`}>
              {player ? "😎" : "🪑"}
            </div>
            <span className={`font-heading text-xl font-bold ${player ? "text-[#2C2C2C]" : "text-[#2C2C2C]/50"}`}>
              {player ? player.name : "Waiting..."}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

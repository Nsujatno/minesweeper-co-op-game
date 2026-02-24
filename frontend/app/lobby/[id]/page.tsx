"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import PlayerListBento from "@/components/lobby/PlayerListBento";
import InviteCodeBento from "@/components/lobby/InviteCodeBento";
import StartGameBento from "@/components/lobby/StartGameBento";

export default function LobbyPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const lobbyCode = (rawId || "ABCD").toUpperCase();

  // Temporary placeholder state until backend is wired up
  const [players] = useState([
    { name: "Natha", colorClass: "bg-[#FF6B6B]" },
    { name: "Player 2", colorClass: "bg-[#4ECDC4]" },
  ]);

  const handleStartGame = () => {
    console.log("Starting game for lobby:", lobbyCode);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col gap-8 mt-8 mb-12">
        <motion.div 
          className="w-full text-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-heading text-3xl font-black text-[#2C2C2C]">
            💣 MineSweep Together
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Player List on the Left, spanning 2 columns on larger screens */}
          <div className="lg:col-span-2">
            <PlayerListBento players={players} />
          </div>

          {/* Right side modules */}
          <div className="flex flex-col gap-6">
            <InviteCodeBento code={lobbyCode} />
            <div className="flex-1">
              <StartGameBento
                canStart={players.length >= 2}
                onStartClick={handleStartGame}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

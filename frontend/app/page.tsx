"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ActionButton from "@/components/ActionButton";
import NameInput from "@/components/NameInput";
import JoinModal from "@/components/JoinModal";
import HeroTitle from "@/components/HeroTitle";

export default function Home() {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleCreateGame = () => {
    if (!playerName.trim()) return;
    console.log("Create Game clicked, Name:", playerName);
    // Placeholder navigation; eventually server generates ID
    router.push("/lobby/ABCD"); 
  };

  const handleJoinClick = () => {
    if (!playerName.trim()) return;
    setIsJoinModalOpen(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 4 && playerName.trim()) {
      console.log("Joining game with code:", joinCode, "Name:", playerName);
      // Navigate to the joined lobby
      router.push(`/lobby/${joinCode}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        
        <HeroTitle />

        {/* Input & Buttons Area */}
        <motion.div 
          className="w-full flex flex-col gap-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
        >
          <NameInput value={playerName} onChange={setPlayerName} />

          <div className="flex gap-4 w-full">
            <ActionButton
              variant="create"
              label="Create"
              onClick={handleCreateGame}
              disabled={!playerName.trim()}
              className="flex-1"
            />
            <ActionButton
              variant="join"
              label="Join"
              onClick={handleJoinClick}
              disabled={!playerName.trim()}
              className="flex-1"
            />
          </div>
        </motion.div>
      </div>

      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onSubmit={handleJoinSubmit}
      />
    </main>
  );
}

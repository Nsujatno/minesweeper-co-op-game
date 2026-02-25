"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ActionButton from "@/components/ActionButton";
import NameInput from "@/components/NameInput";
import JoinModal from "@/components/JoinModal";
import HeroTitle from "@/components/HeroTitle";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function Home() {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateGame = async () => {
    if (!playerName.trim() || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/lobby/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create lobby");
      sessionStorage.setItem("playerName", playerName.trim());
      router.push(`/lobby/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClick = () => {
    if (!playerName.trim()) return;
    setError("");
    setIsJoinModalOpen(true);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length !== 4 || !playerName.trim() || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/lobby/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.toUpperCase(), name: playerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join lobby");
      sessionStorage.setItem("playerName", playerName.trim());
      setIsJoinModalOpen(false);
      router.push(`/lobby/${joinCode.toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
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

          {error && (
            <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] rounded-2xl px-4 py-2 text-center">
              <p className="font-sans font-bold text-[#FF6B6B] text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4 w-full">
            <ActionButton
              variant="create"
              label={isLoading ? "..." : "Create ✨"}
              onClick={handleCreateGame}
              disabled={!playerName.trim() || isLoading}
              className="flex-1"
            />
            <ActionButton
              variant="join"
              label="Join 🤝"
              onClick={handleJoinClick}
              disabled={!playerName.trim() || isLoading}
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

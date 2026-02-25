"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import PlayerListBento from "@/components/lobby/PlayerListBento";
import InviteCodeBento from "@/components/lobby/InviteCodeBento";
import StartGameBento from "@/components/lobby/StartGameBento";

const PLAYER_COLOR_CLASSES: Record<string, string> = {
  coral: "bg-[#FF6B6B]",
  teal: "bg-[#4ECDC4]",
  yellow: "bg-[#FFE66D]",
  purple: "bg-[#A593E0]",
};

interface Player {
  name: string;
  color: string;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const lobbyCode = (rawId || "ABCD").toUpperCase();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const storedName = sessionStorage.getItem("playerName") ?? "Player";

    // ── Named handlers so we can remove exactly these (not all listeners) ──
    const onLobbyState = ({ players: p, isHost: h }: { players: Player[]; isHost: boolean; status: string }) => {
      setPlayers(p);
      setIsHost(h);
    };
    const onPlayerJoined = ({ players: p }: { players: Player[] }) => setPlayers(p);
    const onPlayerLeft = ({ players: p }: { players: Player[] }) => setPlayers(p);
    const onGameStart = () => router.push(`/game/${lobbyCode}`);

    // The connect handler fires if the socket disconnects and reconnects
    const onConnect = () => {
      socket.emit("lobby:join", { code: lobbyCode, name: storedName });
    };

    // Register listeners FIRST — before any emit — so we never miss a response
    socket.on("lobby:state", onLobbyState);
    socket.on("player:joined", onPlayerJoined);
    socket.on("player:left", onPlayerLeft);
    socket.on("game:start", onGameStart);
    socket.on("connect", onConnect);

    // Emit lobby:join now if already connected; the connect handler covers the other case
    if (socket.connected) {
      socket.emit("lobby:join", { code: lobbyCode, name: storedName });
    }

    return () => {
      // Remove only THIS mount's handlers — not every listener on these events
      socket.off("lobby:state", onLobbyState);
      socket.off("player:joined", onPlayerJoined);
      socket.off("player:left", onPlayerLeft);
      socket.off("game:start", onGameStart);
      socket.off("connect", onConnect);
      // Do NOT disconnect — the singleton socket must survive navigation to /game
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode]);

  const handleStartGame = () => {
    getSocket().emit("game:start", { code: lobbyCode });
  };

  const displayPlayers = players.map((p) => ({
    name: p.name,
    colorClass: PLAYER_COLOR_CLASSES[p.color] ?? "bg-[#A593E0]",
  }));

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
          <div className="lg:col-span-2">
            <PlayerListBento players={displayPlayers} />
          </div>

          <div className="flex flex-col gap-6">
            <InviteCodeBento code={lobbyCode} />
            <div className="flex-1">
              <StartGameBento
                canStart={isHost && players.length >= 2}
                onStartClick={handleStartGame}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import PlayerListBento from "@/components/lobby/PlayerListBento";
import InviteCodeBento from "@/components/lobby/InviteCodeBento";
import StartGameBento from "@/components/lobby/StartGameBento";
import DifficultyBento, { type Difficulty } from "@/components/lobby/DifficultyBento";
import ChatBento, { type ChatMessage } from "@/components/lobby/ChatBento";

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
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Track your own socket id so we can mark isSelf correctly
  const mySocketId = useRef<string>("");
  // Track your own name so messages from yourself are marked isSelf
  const myName = useRef<string>("");

  useEffect(() => {
    const socket = getSocket();
    const storedName = sessionStorage.getItem("playerName") ?? "Player";
    myName.current = storedName;
    mySocketId.current = socket.id ?? "";

    const onLobbyState = ({
      players: p,
      isHost: h,
      difficulty: d,
    }: {
      players: Player[];
      isHost: boolean;
      status: string;
      difficulty: Difficulty;
    }) => {
      setPlayers(p);
      setIsHost(h);
      if (d) setDifficulty(d);
    };

    const onPlayerJoined = ({ players: p }: { players: Player[] }) => setPlayers(p);
    const onPlayerLeft = ({ players: p }: { players: Player[] }) => setPlayers(p);
    const onGameStart = () => router.push(`/game/${lobbyCode}`);
    const onDifficultyChanged = ({ difficulty: d }: { difficulty: Difficulty }) =>
      setDifficulty(d);

    const onChatMessage = ({
      name,
      color,
      text,
      timestamp,
    }: {
      name: string;
      color: string;
      text: string;
      timestamp: number;
    }) => {
      const msg: ChatMessage = {
        id: `${timestamp}-${name}-${Math.random()}`,
        name,
        color,
        text,
        timestamp,
        isSelf: name === myName.current,
      };
      setMessages((prev) => [...prev, msg]);
    };

    const onConnect = () => {
      mySocketId.current = socket.id ?? "";
      socket.emit("lobby:join", { code: lobbyCode, name: storedName });
    };

    socket.on("lobby:state", onLobbyState);
    socket.on("player:joined", onPlayerJoined);
    socket.on("player:left", onPlayerLeft);
    socket.on("game:start", onGameStart);
    socket.on("lobby:difficultyChanged", onDifficultyChanged);
    socket.on("chat:message", onChatMessage);
    socket.on("connect", onConnect);

    if (socket.connected) {
      socket.emit("lobby:join", { code: lobbyCode, name: storedName });
    }

    return () => {
      socket.off("lobby:state", onLobbyState);
      socket.off("player:joined", onPlayerJoined);
      socket.off("player:left", onPlayerLeft);
      socket.off("game:start", onGameStart);
      socket.off("lobby:difficultyChanged", onDifficultyChanged);
      socket.off("chat:message", onChatMessage);
      socket.off("connect", onConnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode]);

  const handleStartGame = () => {
    getSocket().emit("game:start", { code: lobbyCode });
  };

  const handleDifficultySelect = (d: Difficulty) => {
    setDifficulty(d); // optimistic update
    getSocket().emit("lobby:setDifficulty", { code: lobbyCode, difficulty: d });
  };

  const handleSendMessage = (text: string) => {
    getSocket().emit("chat:send", { code: lobbyCode, text });
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
          {/* Left: player list + difficulty */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PlayerListBento players={displayPlayers} />
            <DifficultyBento
              selected={difficulty}
              isHost={isHost}
              onSelect={handleDifficultySelect}
            />
          </div>

          {/* Right: invite code + start */}
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

        {/* Full-width chat row */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.7, delay: 0.15 }}
        >
          <ChatBento messages={messages} onSend={handleSendMessage} />
        </motion.div>
      </div>
    </main>
  );
}

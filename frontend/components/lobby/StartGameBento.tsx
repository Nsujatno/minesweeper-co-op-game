"use client";

import ActionButton from "@/components/ActionButton";

interface StartGameBentoProps {
  canStart: boolean;
  onStartClick: () => void;
}

export default function StartGameBento({ canStart, onStartClick }: StartGameBentoProps) {
  return (
    <div className="bg-[#4ECDC4] p-6 border-4 border-b-8 border-[#2C2C2C] rounded-3xl flex flex-col items-center justify-center gap-4 text-center h-full">
      <div className="text-5xl mb-2">🎮</div>
      <h3 className="font-heading text-2xl font-black text-[#2C2C2C] mb-2">
        Ready to play?
      </h3>
      <ActionButton
        variant="create"
        label="Start Game"
        onClick={onStartClick}
        disabled={!canStart}
        className="w-full mt-2"
      />
      {!canStart && (
        <p className="font-sans text-sm font-bold text-[#2C2C2C] bg-white/50 px-3 py-1 rounded-full">
          Waiting for players... (2 minimum)
        </p>
      )}
    </div>
  );
}

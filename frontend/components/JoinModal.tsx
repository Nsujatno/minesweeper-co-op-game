"use client";

import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "./ActionButton";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function JoinModal({
  isOpen,
  onClose,
  joinCode,
  setJoinCode,
  onSubmit,
}: JoinModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#FAF8F5]/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="bg-[#FAF8F5] p-8 border-4 border-b-8 border-[#2C2C2C] rounded-3xl w-full max-w-sm relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl w-10 h-10 flex items-center justify-center bg-[#FFE66D] border-2 border-b-4 border-[#2C2C2C] rounded-full hover:bg-[#f5dd63] active:border-b-2 active:translate-y-[2px] transition-transform"
            >
              ✖
            </button>

            <h2 className="font-heading text-3xl font-black mb-6 text-center text-[#2C2C2C]">
              Enter Invite Code
            </h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                className="w-full p-4 text-center text-4xl font-heading font-black tracking-[0.5em] bg-white border-4 border-[#2C2C2C] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A593E0]/50 placeholder:text-gray-300 uppercase transition-colors"
                autoFocus
              />
              <ActionButton
                variant="submit"
                label="Join 🚀"
                type="submit"
                disabled={joinCode.length !== 4}
                className="w-full mt-2"
              />
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

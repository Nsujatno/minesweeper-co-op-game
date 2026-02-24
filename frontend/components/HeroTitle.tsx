"use client";

import { motion } from "framer-motion";

export default function HeroTitle() {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="text-center"
    >
      <div className="text-6xl mb-4">💣🚩</div>
      <h1 className="font-heading text-5xl md:text-6xl font-black text-[#2C2C2C] drop-shadow-sm mb-2">
        MineSweep
        <br />
        Together
      </h1>
      <p className="font-sans text-xl text-[#2C2C2C]/80 font-bold">
        Real-time Co-op Minesweeper
      </p>
    </motion.div>
  );
}

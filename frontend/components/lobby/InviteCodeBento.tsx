"use client";

import { useState } from "react";

interface InviteCodeBentoProps {
  code: string;
}

export default function InviteCodeBento({ code }: InviteCodeBentoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FFE66D] p-6 border-4 border-b-8 border-[#2C2C2C] rounded-3xl flex flex-col items-center justify-center text-center">
      <h3 className="font-sans font-bold text-[#2C2C2C]/80 mb-2 uppercase tracking-widest text-sm">
        Invite Code
      </h3>
      <button
        onClick={handleCopy}
        title="Click to copy"
        className="relative bg-white px-6 py-4 border-4 border-[#2C2C2C] rounded-2xl w-full cursor-pointer hover:bg-[#f5f5f5] active:scale-95 transition-transform"
      >
        {copied && (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4ECDC4] text-white text-xs font-bold font-sans px-3 py-1 rounded-full border-2 border-[#2C2C2C] whitespace-nowrap">
            ✓ Copied!
          </span>
        )}
        <span className="font-heading text-4xl sm:text-5xl font-black tracking-[0.2em] text-[#2C2C2C]">
          {code}
        </span>
      </button>
      <p className="font-sans text-sm font-bold text-[#2C2C2C]/60 mt-4">
        Share this code with your friends!
      </p>
    </div>
  );
}

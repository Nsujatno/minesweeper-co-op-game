"use client";

interface InviteCodeBentoProps {
  code: string;
}

export default function InviteCodeBento({ code }: InviteCodeBentoProps) {
  return (
    <div className="bg-[#FFE66D] p-6 border-4 border-b-8 border-[#2C2C2C] rounded-3xl flex flex-col items-center justify-center text-center">
      <h3 className="font-sans font-bold text-[#2C2C2C]/80 mb-2 uppercase tracking-widest text-sm">
        Invite Code
      </h3>
      <div className="bg-white px-6 py-4 border-4 border-[#2C2C2C] rounded-2xl w-full">
        <span className="font-heading text-4xl sm:text-5xl font-black tracking-[0.2em] text-[#2C2C2C]">
          {code}
        </span>
      </div>
      <p className="font-sans text-sm font-bold text-[#2C2C2C]/60 mt-4">
        Share this code with your friends!
      </p>
    </div>
  );
}

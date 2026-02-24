"use client";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your name..."
      maxLength={15}
      className="w-full p-4 text-center text-2xl font-heading font-bold bg-white border-4 border-[#2C2C2C] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A593E0]/50 placeholder:text-gray-300 transition-colors"
    />
  );
}

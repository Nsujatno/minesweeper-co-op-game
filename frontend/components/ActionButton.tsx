"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface ActionButtonProps extends HTMLMotionProps<"button"> {
  variant: "create" | "join" | "submit";
  label: string;
}

export default function ActionButton({ variant, label, className = "", ...props }: ActionButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case "create":
        return "bg-[#FF6B6B] hover:bg-[#ff5252]";
      case "join":
        return "bg-[#4ECDC4] hover:bg-[#3dbbb2]";
      case "submit":
        return "bg-[#FF6B6B]";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "create":
        return "✨";
      case "join":
        return "🤝";
      case "submit":
        return null;
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 4, borderBottomWidth: "4px" }}
      className={`py-4 px-2 border-4 border-b-8 border-[#2C2C2C] rounded-2xl font-heading text-xl sm:text-2xl text-[#2C2C2C] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getStyles()} ${className}`}
      {...props}
    >
      {getIcon() && <span>{getIcon()}</span>}
      {label}
    </motion.button>
  );
}

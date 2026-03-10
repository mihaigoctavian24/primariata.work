"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function Highlight({ children, className, active = true }: HighlightProps) {
  return (
    <motion.span
      animate={{ backgroundSize: active ? "100% 100%" : "0% 100%" }}
      transition={{ duration: active ? 0.8 : 0.4, ease: "linear" }}
      className={cn(
        "inline rounded-md px-1.5 py-0.5",
        active ? "text-background" : "text-foreground",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(to right, var(--foreground), var(--foreground))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        backgroundSize: "0% 100%",
      }}
    >
      {children}
    </motion.span>
  );
}

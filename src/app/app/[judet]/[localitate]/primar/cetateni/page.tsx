"use client";

import { motion } from "motion/react";
import { Users } from "lucide-react";

export default function PrimarCetateniPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        <Users className="h-8 w-8 text-amber-400" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-2xl font-bold text-white"
      >
        Cetățeni
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-md text-center text-sm text-gray-500"
      >
        Evidența cetățenilor, interacțiuni, audiențe și comunicare directă.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-6 rounded-xl px-4 py-2 text-xs font-semibold text-amber-400"
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        În dezvoltare
      </motion.div>
    </div>
  );
}

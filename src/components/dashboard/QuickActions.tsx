"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  judet: string;
  localitate: string;
}

export function QuickActions({ judet, localitate }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="bg-card border-border/40 rounded-lg border p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold">Acțiuni Rapide</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/app/${judet}/${localitate}/cereri/new`} className="flex-1">
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Cerere Nouă
          </Button>
        </Link>
        <Link href={`/app/${judet}/${localitate}/plati`} className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            <CreditCard className="mr-2 h-5 w-5" />
            Plătește Taxe
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

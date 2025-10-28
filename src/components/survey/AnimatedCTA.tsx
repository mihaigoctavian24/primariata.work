"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AnimatedCTA Component
 *
 * Final call-to-action section with animation
 */
export function AnimatedCTA() {
  return (
    <section className="px-4 py-16">
      <motion.div
        className="container mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5.7, duration: 0.6 }}
      >
        <h2 className="mb-4 text-3xl font-bold">Ești gata să începi?</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Îți ia doar 5 minute și ajuți la construirea unei primării mai eficiente pentru toți.
        </p>
        <Link href="/survey/start" className="inline-block min-w-[250px]">
          <Button size="lg" className="group w-full">
            Începe chestionarul acum
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

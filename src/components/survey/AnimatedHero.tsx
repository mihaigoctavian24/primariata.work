"use client";

import { motion } from "framer-motion";
import TextType from "@/components/TextType";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * AnimatedHero Component for Survey Landing Page
 *
 * Features:
 * - Logo "primariaTa❤️" with typing animation and beating heart
 * - Typing text "Ajută-ne să construim primariaTa❤️_"
 * - Blur-in text "primăria digitală ideală"
 * - Animated CTAs
 */

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          {/* Main heading with inline animated logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <h1
              className="relative text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
            >
              <span className="relative inline-block">
                <TextType
                  text="Ajută-ne să construim primariaTa   "
                  as="span"
                  className="inline"
                  charStyler={(_char, idx) => {
                    // "Ta" is at indices 30 and 31 (after "Ajută-ne să construim primaria")
                    if (idx === 30 || idx === 31) {
                      return { color: "oklch(0.712 0.194 13.428)" };
                    }
                    return {};
                  }}
                  typingSpeed={75}
                  initialDelay={600}
                  showCursor={true}
                  cursorCharacter="_"
                  loop={false}
                />
                <motion.span
                  className="absolute inline-block"
                  style={{
                    left: "27ch",
                    top: "0%",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: [
                      1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1,
                      1.08, 1,
                    ],
                  }}
                  transition={{
                    opacity: {
                      duration: 0.3,
                      delay: 3.45,
                    },
                    scale: {
                      duration: 8,
                      delay: 3.85,
                      times: [
                        0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52,
                        0.53, 0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                      ],
                      ease: [0.4, 0, 0.6, 1],
                      repeat: Infinity,
                    },
                  }}
                >
                  ❤️
                </motion.span>
              </span>
            </h1>
          </motion.div>

          {/* Subheading with blur-in animation */}
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 3.5, duration: 1 }}
            className="text-primary mb-8 text-xl font-bold md:text-2xl lg:text-3xl"
          >
            Primăria digitală ideală
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/survey/start" className="min-w-[200px]">
              <Button size="lg" className="group w-full">
                Începe chestionarul
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/" className="min-w-[200px]">
              <Button variant="outline" size="lg" className="w-full">
                Înapoi la pagina principală
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

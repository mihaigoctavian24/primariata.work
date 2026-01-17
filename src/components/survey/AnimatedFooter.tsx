"use client";

import { motion, useAnimation } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * AnimatedFooter Component
 *
 * Footer with privacy note and GitHub stars call-to-action
 */
export function AnimatedFooter() {
  const [isDark, setIsDark] = useState(false);
  const cursorControls = useAnimation();

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Start cursor blinking animation
    cursorControls.start({
      opacity: [0, 1, 1, 0],
    });

    return () => observer.disconnect();
  }, [cursorControls]);

  return (
    <motion.footer
      className="border-border/50 bg-muted/30 border-t px-4 py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 6.0, duration: 0.6 }}
    >
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Privacy notice */}
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          🔒 Toate răspunsurile sunt confidențiale și vor fi folosite doar pentru îmbunătățirea
          serviciilor publice digitale.
        </p>

        {/* Divider */}
        <div
          className={`mx-auto h-px w-24 border-t ${isDark ? "border-slate-700" : "border-slate-300"}`}
        />

        {/* GitHub CTA */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-1">
            <span
              className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              <span>primaria</span>
              <span style={{ color: "oklch(0.712 0.194 13.428)" }}>Ta</span>
            </span>
            <motion.span
              className="inline-block text-2xl"
              initial={{ scale: 1 }}
              animate={{
                scale: [
                  1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08,
                  1,
                ],
              }}
              transition={{
                duration: 8,
                times: [
                  0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52, 0.53,
                  0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                ],
                ease: [0.4, 0, 0.6, 1],
                repeat: Infinity,
              }}
            >
              ❤️
            </motion.span>
            <motion.span
              className={`inline-block text-2xl ${isDark ? "text-slate-100" : "text-slate-900"}`}
              initial={{ opacity: 0 }}
              animate={cursorControls}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.1, 0.9, 1],
              }}
            >
              _
            </motion.span>
          </div>

          <div
            className={`mx-auto max-w-2xl text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            <p>
              Dacă îți place munca noastră și vrei să ne susții în continuare, oferă-ne o{" "}
              <Star className="inline h-4 w-4 fill-yellow-400 text-yellow-400" /> pe GitHub!
            </p>
            <p>
              Fiecare <Star className="inline h-4 w-4 fill-yellow-400 text-yellow-400" /> ne
              motivează să mergem mai departe și să construim o primărie digitală mai bună pentru
              toți.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com/mihaigoctavian24/primariata.work"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className={`group gap-2 transition-all hover:shadow-lg ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                <Image
                  src={isDark ? "/github-mark.svg" : "/github-mark-white.svg"}
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span>Vezi pe GitHub</span>
                <Star className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:fill-yellow-400 group-hover:text-yellow-400" />
              </Button>
            </a>
          </div>

          <p className={`text-xs ${isDark ? "text-slate-400/70" : "text-slate-600/70"}`}>
            Proiect universitar open-source dezvoltat cu{" "}
            <Heart className="inline h-3 w-3 fill-red-500 text-red-500" /> pentru comunitate.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

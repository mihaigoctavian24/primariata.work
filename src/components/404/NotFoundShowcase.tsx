"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";

export function NotFoundShowcase() {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      {/* Simplified Background - Static Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle Gradient Overlays - Reduced blur for performance */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-600/5" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/5" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Sliding Number 404 */}
          <div className="mb-8">
            <h1 className="text-primary inline-flex gap-2 text-9xl font-bold md:text-[12rem]">
              <SlidingNumber
                number={4}
                className="text-primary text-9xl font-bold md:text-[12rem]"
                transition={{
                  stiffness: 90, // Fastest
                  damping: 15,
                  mass: 1.0,
                }}
                delay={0}
              />
              <SlidingNumber
                number={0}
                className="text-primary text-9xl font-bold md:text-[12rem]"
                transition={{
                  stiffness: 70, // Medium speed
                  damping: 13,
                  mass: 1.3,
                }}
                delay={400}
              />
              <SlidingNumber
                number={4}
                className="text-primary text-9xl font-bold md:text-[12rem]"
                transition={{
                  stiffness: 55, // Slowest - finishes last
                  damping: 11,
                  mass: 1.5,
                }}
                delay={700}
              />
            </h1>
          </div>

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-foreground mb-4 text-2xl font-semibold md:text-3xl"
          >
            Oooppss ... pagina nu a fost găsită :(
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground mb-8 text-base md:text-lg"
          >
            Se pare că pagina pe care o cauți nu există sau a fost mutată.
          </motion.p>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link href="/">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                <Home className="h-4 w-4" />
                Înapoi acasă
              </Button>
            </Link>
            <Link href="/survey">
              <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                <Search className="h-4 w-4" />
                Explorează aplicația
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TextType from "@/components/TextType";
import { MorphingText } from "@/components/ui/morphing-text";
import PixelBlast from "@/components/ui/PixelBlast";
import CountUp from "@/components/ui/CountUp";

/**
 * Hero Section Component for Landing Page
 *
 * Features:
 * - Animated logo with typing effect and pulsating heart emoticon
 * - Multi-phase animation: center → typing → shrink & move up → content reveal
 * - Staggered fade-in subtitle
 * - Hover/tap animations on CTA button
 * - Stats section with key metrics
 * - Fully responsive (375px - 1920px)
 * - WCAG 2.1 AA accessible
 * - 60 FPS animations
 * - Zero layout shifts (CLS = 0)
 */
export function HeroSection() {
  const router = useRouter();
  const [animationPhase, setAnimationPhase] = useState<"typing" | "shrinking" | "complete">(
    "typing"
  );
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  // Character styler for custom coloring
  const charStyler = (_char: string, index: number) => {
    // "primariaTa   " - indices 8 and 9 are "Ta"
    if (index === 8 || index === 9) {
      return { color: "oklch(0.712 0.194 13.428)" };
    }
    return {};
  };

  // Calculate typing duration and trigger phase transitions
  useEffect(() => {
    const textBeforeHeart = "primariaTa"; // 10 characters
    const typingSpeed = 75;
    const typingDuration = textBeforeHeart.length * typingSpeed + 500; // +500ms buffer
    const pauseDuration = 8000; // 8s pause after typing for heartbeat
    const shrinkDuration = 800; // 0.8s for shrink animation
    const cascadeDelay = 400; // 400ms between each element

    // Show heart after "primariaTa" finishes typing
    const showHeartTimer = setTimeout(() => {
      setShowHeart(true);
    }, typingDuration);

    // After heart appears, start heartbeat animation
    const heartbeatTimer = setTimeout(() => {
      setHeartbeatActive(true);
    }, typingDuration + 100); // Small delay after heart appears

    // After typing completes + 2s pause, trigger shrink animation
    const typingTimer = setTimeout(() => {
      setAnimationPhase("shrinking");
      setHeartbeatActive(false); // Stop heartbeat when shrinking starts
    }, typingDuration + pauseDuration);

    // After shrinking completes, trigger cascade
    const baseTime = typingDuration + pauseDuration + shrinkDuration;

    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
    }, baseTime + cascadeDelay);

    const buttonTimer = setTimeout(
      () => {
        setShowButton(true);
      },
      baseTime + cascadeDelay * 2
    );

    const statsTimer = setTimeout(
      () => {
        setShowStats(true);
        setAnimationPhase("complete");
      },
      baseTime + cascadeDelay * 3
    );

    return () => {
      clearTimeout(showHeartTimer);
      clearTimeout(heartbeatTimer);
      clearTimeout(typingTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(buttonTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  // Logo animation variants - stays in center, only shrinks
  const logoVariants = {
    typing: {
      scale: 1.8,
      transition: {
        duration: 0,
      },
    },
    shrinking: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      },
    },
    complete: {
      scale: 1,
      transition: {
        duration: 0,
      },
    },
  };

  // Cascade animation variants for content elements
  const cascadeVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const stats = [
    {
      value: "13,851",
      label: "Localități",
      countUp: { from: 0, to: 13851, direction: "up" as const, separator: "," },
    },
    {
      value: "0",
      label: "Cozi",
      countUp: { from: 0, to: 100, direction: "down" as const },
    },
    {
      value: "24/7",
      label: "Disponibil",
      countUp: {
        parts: [
          { from: 0, to: 24, type: "countup" as const },
          { value: "/", type: "static" as const },
          { from: 0, to: 7, type: "countup" as const },
        ],
      },
    },
  ];

  return (
    <section
      className="relative flex h-screen items-center justify-center overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Hero section - Pagina principală Primăriata"
    >
      {/* PixelBlast animated background */}
      <div
        className="absolute top-0 left-0 h-screen w-screen"
        style={{
          zIndex: 1,
          backgroundColor: "oklch(0.929 0.013 255.508)",
        }}
      >
        <PixelBlast
          variant="triangle"
          pixelSize={6}
          color="#cfd8e3"
          patternScale={1.75}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={1}
          liquid={false}
          speed={0.5}
          edgeFade={0.25}
          transparent={true}
        />
      </div>

      {/* Logo - fixed in center, always */}
      <motion.div
        variants={logoVariants}
        initial="typing"
        animate={animationPhase}
        className="fixed top-[38%] left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      >
        <h1 className="relative text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-8xl">
          <TextType
            text={["primariaTa   "]}
            as="span"
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="_"
            loop={false}
            className="inline"
            charStyler={charStyler}
          />
          {showHeart && (
            <motion.span
              className="absolute inline-block"
              style={{
                left: "8.6ch", // Position closer to "primariaTa"
                top: "0%", // Direct positioning instead of translateY
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                heartbeatActive
                  ? {
                      opacity: 1,
                      scale: [
                        1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1,
                        1.08, 1,
                      ], // Four LUB-DUB cycles
                    }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                heartbeatActive
                  ? {
                      scale: {
                        duration: 8,
                        times: [
                          0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51, 0.52,
                          0.53, 0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                        ], // bum-bum ... bum-bum ... bum-bum ... bum-bum over 8s
                        ease: [0.4, 0, 0.6, 1], // Natural, non-elastic easing
                        repeat: 0, // No repeat, just once during the 8s pause
                      },
                      opacity: {
                        duration: 0.3,
                      },
                    }
                  : {
                      duration: 0.3,
                      ease: "easeOut" as const,
                    }
              }
            >
              ❤️
            </motion.span>
          )}
        </h1>

        {/* Morphing text below logo during heartbeat */}
        {heartbeatActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-full left-1/2 mt-8 w-[500px] -translate-x-1/2"
          >
            <MorphingText
              texts={[
                "rapidă",
                "transparentă",
                "accesibilă",
                "rapidă",
                "transparentă",
                "accesibilă",
              ]}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Content container - appears below fixed logo */}
      <div className="relative z-10 mx-auto max-w-4xl pt-[32vh] text-center">
        {/* Subtitle */}
        <motion.div
          variants={cascadeVariants}
          initial="hidden"
          animate={showSubtitle ? "visible" : "hidden"}
          className="mb-8"
        >
          <p className="text-lg text-gray-600 sm:text-xl md:text-2xl lg:text-3xl">
            Bine ai venit la Primăria ta digitală.
          </p>
          <p className="mt-2 text-base text-gray-500 sm:text-lg md:text-xl">
            Servicii publice online, fără cozi, 24/7.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={cascadeVariants}
          initial="hidden"
          animate={showButton ? "visible" : "hidden"}
          className="mb-16"
        >
          <motion.button
            className="ring-offset-background inline-flex h-12 min-w-[200px] items-center justify-center rounded-full px-8 text-base font-semibold text-white shadow-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-14 sm:px-10 sm:text-lg"
            style={{
              backgroundColor: "oklch(0.712 0.194 13.428)",
            }}
            onClick={() => router.push("/app/dashboard")}
            aria-label="Continuă către aplicație"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
          >
            Continuă
          </motion.button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={cascadeVariants}
          initial="hidden"
          animate={showStats ? "visible" : "hidden"}
          className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div
                className="mb-2 flex w-[120px] items-center justify-center rounded-lg px-3 py-2 sm:w-[140px] sm:px-4 sm:py-3 md:w-[160px]"
                style={{
                  backgroundColor: "rgba(248, 250, 252, 0.85)",
                  boxShadow: "inset 0 3px 12px 0 rgba(0, 0, 0, 0.25)",
                }}
              >
                {stat.countUp ? (
                  // Check if countUp has parts (for 24/7 case)
                  "parts" in stat.countUp && stat.countUp.parts ? (
                    <span
                      className="text-2xl font-bold sm:text-3xl md:text-4xl"
                      style={{ color: "#4a6cf6" }}
                    >
                      {stat.countUp.parts.map((part, idx) => {
                        if (part.type === "static") {
                          return <span key={idx}>{part.value}</span>;
                        }
                        return (
                          <CountUp
                            key={idx}
                            from={part.from}
                            to={part.to}
                            direction="up"
                            duration={2}
                            delay={0.5}
                            startWhen={showStats}
                          />
                        );
                      })}
                    </span>
                  ) : (
                    <CountUp
                      from={stat.countUp.from}
                      to={stat.countUp.to}
                      direction={stat.countUp.direction}
                      separator={stat.countUp.separator}
                      duration={2}
                      delay={0.5}
                      className="text-2xl font-bold sm:text-3xl md:text-4xl"
                      startWhen={showStats}
                    />
                  )
                ) : (
                  <span
                    className="text-2xl font-bold sm:text-3xl md:text-4xl"
                    style={{ color: "#4a6cf6" }}
                  >
                    {stat.value}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-gray-600 sm:text-sm md:text-base">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Accessibility: Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          Sari la conținut
        </a>
      </div>
    </section>
  );
}

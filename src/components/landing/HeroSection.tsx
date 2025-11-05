"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import TextType from "@/components/TextType";
import { MorphingText } from "@/components/ui/morphing-text";
import CountUp from "@/components/ui/CountUp";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocationWheelPickerForm } from "@/components/location/LocationWheelPickerForm";
import { saveLocation } from "@/lib/location-storage";

// Dynamic import for PixelBlast to prevent SSR issues and reduce initial bundle
const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
  loading: () => <div className="bg-background absolute inset-0" />,
});

/**
 * Hero Section Component for Landing Page - Multi-Step Flow
 *
 * STEP 1: Welcome screen with animated logo, subtitle, stats
 * STEP 2: Location selection with wheel pickers
 * → After STEP 2: Redirect to /auth/login (auth required)
 *
 * Features:
 * - Animated logo with typing effect and pulsating heart emoticon
 * - Multi-phase animation: center → typing → shrink & move up → content reveal
 * - Staggered fade-in subtitle
 * - Hover/tap animations on CTA button
 * - Stats section with key metrics
 * - Blur animations between steps
 * - Fully responsive (375px - 1920px)
 * - WCAG 2.1 AA accessible
 * - 60 FPS animations
 * - Zero layout shifts (CLS = 0)
 */
export function HeroSection() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [animationPhase, setAnimationPhase] = useState<"typing" | "shrinking" | "complete">(
    "typing"
  );
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [typingScale, setTypingScale] = useState(1.5);
  const [step2HeartbeatActive, setStep2HeartbeatActive] = useState(false);
  const [searchInputLength, setSearchInputLength] = useState(0);

  // Refs for dynamic button positioning
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonTargetY, setButtonTargetY] = useState(200); // Default placeholder

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get PixelBlast color based on theme
  const pixelBlastColor = mounted && resolvedTheme === "dark" ? "#90a1b9" : "#e2e8f0";

  // Get stats box colors based on theme
  const statsBoxBg = mounted && resolvedTheme === "dark" ? "#1d293d" : "rgba(255, 255, 255, 0.85)";
  const statsTextColor = mounted && resolvedTheme === "dark" ? "#f0bf17" : "#2563eb";

  // Update typing scale after mount to avoid hydration mismatch
  useEffect(() => {
    const updateScale = () => {
      setTypingScale(window.innerWidth < 640 ? 1.5 : 1.8);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

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

  // Calculate dynamic button position to move to stats zone + 40px extra
  useEffect(() => {
    if (statsRef.current && buttonRef.current && step === 2) {
      const statsRect = statsRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const targetY = statsRect.top - buttonRect.top + 40; // +40px extra offset
      setButtonTargetY(targetY);
    }
  }, [step, showStats]);

  // Trigger heartbeat for STEP 2 title
  useEffect(() => {
    if (step === 2) {
      // Start heartbeat after typing completes (1.5s delay)
      const heartbeatTimer = setTimeout(() => {
        setStep2HeartbeatActive(true);
      }, 1500);

      return () => {
        clearTimeout(heartbeatTimer);
      };
    } else {
      setStep2HeartbeatActive(false);
      return undefined;
    }
  }, [step]);

  // Logo animation variants - stays in center, only shrinks
  const logoVariants = useMemo(
    () => ({
      typing: {
        scale: typingScale,
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
    }),
    [typingScale]
  );

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

  // Handler pentru dual-role button
  const handleButtonClick = () => {
    if (step === 1) {
      // STEP 1: Transition to location selection
      setStep(2);
    } else if (step === 2) {
      // STEP 2: Trigger form submit
      // The form will be submitted via ref trigger
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  // Handler pentru submit locație și redirect la login
  const handleLocationSubmit = async (values: { judetId: string; localitateId: string }) => {
    try {
      const [judeteResponse, localitatiResponse] = await Promise.all([
        fetch("/api/localitati/judete"),
        fetch(`/api/localitati?judet_id=${values.judetId}`),
      ]);

      if (!judeteResponse.ok || !localitatiResponse.ok) {
        console.error("Failed to fetch location details");
        return;
      }

      const judeteData = await judeteResponse.json();
      const localitatiData = await localitatiResponse.json();

      const judet = judeteData.data?.find(
        (j: { id: number }) => j.id.toString() === values.judetId
      );
      const localitate = localitatiData.data?.find(
        (l: { id: number }) => l.id.toString() === values.localitateId
      );

      if (!judet || !localitate) {
        console.error("Location not found");
        return;
      }

      saveLocation({
        judetId: judet.id.toString(),
        judetSlug: judet.slug,
        localitateId: localitate.id.toString(),
        localitateSlug: localitate.slug,
      });

      router.push("/auth/login");
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  return (
    <section
      className="bg-background relative flex h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Hero section - Pagina principală Primăriata"
    >
      {/* Theme Toggle - fixed in top right */}
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* PixelBlast animated background - FIXED position, stays in place */}
      <div
        className="fixed top-0 left-0 h-screen w-screen"
        style={{
          zIndex: 0,
        }}
      >
        <PixelBlast
          variant="triangle"
          pixelSize={6}
          color={pixelBlastColor}
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

      {/* Multi-Step Flow - All elements present, controlled by animations */}
      <div className="relative h-full w-full">
        {/* Logo blur wrapper (Layer 1: Background z-10) - responds to step */}
        <motion.div
          className="absolute top-[38%] left-[50%] z-10 -translate-x-1/2 -translate-y-1/2 sm:left-1/2"
          initial={{ opacity: 1, filter: "blur(0px)" }}
          animate={
            step === 2
              ? { opacity: 0.3, filter: "blur(20px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Logo - animated by logoVariants (typing, shrinking, complete) */}
          <motion.div variants={logoVariants} initial="typing" animate={animationPhase}>
            <h1
              className="text-foreground text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))" }}
            >
              <span className="inline-block whitespace-nowrap">
                <TextType
                  text={["primariaTa"]}
                  as="span"
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={false}
                  loop={false}
                  className="inline"
                  charStyler={charStyler}
                />
                {showHeart && (
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      heartbeatActive
                        ? {
                            opacity: 1,
                            scale: [
                              1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1, 1.12, 1, 1.08, 1, 1,
                              1.12, 1, 1.08, 1,
                            ],
                          }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={
                      heartbeatActive
                        ? {
                            scale: {
                              duration: 8,
                              times: [
                                0, 0.01, 0.02, 0.03, 0.04, 0.25, 0.26, 0.27, 0.28, 0.29, 0.5, 0.51,
                                0.52, 0.53, 0.54, 0.75, 0.76, 0.77, 0.78, 0.79,
                              ],
                              ease: [0.4, 0, 0.6, 1],
                              repeat: 0,
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
                <motion.span
                  className="inline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: 1.2,
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  _
                </motion.span>
              </span>
            </h1>

            {/* Morphing text below logo during heartbeat (Layer 1: Background z-10) */}
            {heartbeatActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-foreground absolute top-full left-1/2 z-10 mt-4 w-[280px] -translate-x-1/2 sm:mt-6 sm:w-[400px] md:mt-8 md:w-[500px]"
              >
                <MorphingText texts={["rapidă", "transparentă", "accesibilă"]} />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Content container - appears below fixed logo */}
        <div className="relative mx-auto max-w-4xl pt-[40vh] text-center">
          {/* Subtitle (Layer 2: Middle z-20) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={
              !showSubtitle
                ? { opacity: 0, y: 30 } // Initial cascade - hidden
                : step === 2
                  ? { opacity: 0, y: 0 } // Fade out on STEP 2
                  : { opacity: 1, y: 0 } // Visible on STEP 1
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-20 mb-8"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
          >
            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl">
              Bine ai venit la Primăria ta digitală.
            </p>
            <p className="text-muted-foreground mt-2 text-base opacity-90 sm:text-lg md:text-xl">
              Servicii publice online, fără cozi, 24/7.
            </p>
          </motion.div>

          {/* CTA Button (Layer 4: Top z-40) - moves down in STEP 2, always clickable */}
          <motion.div
            ref={buttonRef}
            initial={{ opacity: 0, y: 30 }}
            animate={
              !showButton
                ? { opacity: 0, y: 30 } // Initial cascade - hidden
                : step === 2
                  ? { opacity: 1, y: buttonTargetY } // Move down to stats zone + 40px
                  : { opacity: 1, y: 0 } // Visible at original position in STEP 1
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
              mass: 2.8,
            }}
            className="relative z-40 mb-16"
          >
            <motion.button
              className="ring-offset-background inline-flex h-12 min-w-[200px] items-center justify-center rounded-full px-8 text-base font-semibold text-white shadow-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-14 sm:px-10 sm:text-lg"
              style={{
                backgroundColor: "oklch(0.712 0.194 13.428)",
                textShadow:
                  "3px 3px 6px rgba(0, 0, 0, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.3)",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
              }}
              onClick={handleButtonClick}
              aria-label="Continuă"
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

            {/* Back Button - Minimalist (only visible in STEP 2) */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={
                step === 2
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 10, filter: "blur(10px)" }
              }
              transition={{
                delay: step === 2 ? 1.0 : 0,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="mt-6 text-center"
            >
              <motion.button
                onClick={() => setStep(1)}
                className="text-muted-foreground text-sm"
                animate={{ fontWeight: 400 }}
                whileHover={{
                  color: "#ED5C46",
                  fontWeight: 700,
                }}
                whileTap={{
                  scale: 0.92,
                  color: "#D74428",
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
                aria-label="Renunță și înapoi"
              >
                Renunță
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats Section (Layer 2: Middle z-20) */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={
              !showStats
                ? { opacity: 0, y: 30, filter: "blur(0px)", scale: 1 } // Initial cascade - hidden
                : step === 2
                  ? { opacity: 0, y: 0, filter: "blur(20px)", scale: 0.8 } // Blur out and disappear on STEP 2
                  : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } // Visible on STEP 1
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-20 flex justify-center gap-2 sm:gap-3 md:gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div
                  className="mb-1.5 flex w-[64px] items-center justify-center rounded-lg px-2 py-1.5 shadow-[inset_0_3px_12px_0_rgba(0,0,0,0.25)] sm:mb-2 sm:w-[110px] sm:px-3 sm:py-2 md:w-[136px]"
                  style={{ backgroundColor: statsBoxBg }}
                >
                  {stat.countUp ? (
                    // Check if countUp has parts (for 24/7 case)
                    "parts" in stat.countUp && stat.countUp.parts ? (
                      <span
                        className="text-xs font-bold sm:text-2xl md:text-3xl"
                        style={{
                          color: statsTextColor,
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                        }}
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
                        className="text-xs font-bold sm:text-2xl md:text-3xl"
                        style={{
                          color: statsTextColor,
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                        }}
                        startWhen={showStats}
                      />
                    )
                  ) : (
                    <span
                      className="text-xs font-bold sm:text-2xl md:text-3xl"
                      style={{
                        color: statsTextColor,
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      }}
                    >
                      {stat.value}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-[10px] font-bold sm:text-xs md:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Accessibility: Skip to content link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-lg focus:ring-2 focus:ring-red-500 focus:outline-none dark:focus:bg-gray-800 dark:focus:text-white"
          >
            Sari la conținut
          </a>
        </div>

        {/* STEP 2: Location Selection (Layer 3: Foreground z-30, centered in viewport) */}
        <motion.div
          className="absolute top-0 left-0 z-30 flex h-screen w-full items-center justify-center px-4"
          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95, y: 0 }}
          animate={
            step === 2
              ? {
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                  y: searchInputLength > 0 && searchInputLength < 3 ? -8 : 0,
                  pointerEvents: "auto" as const,
                }
              : {
                  opacity: 0,
                  filter: "blur(20px)",
                  scale: 0.95,
                  y: 0,
                  pointerEvents: "none" as const,
                }
          }
          transition={{
            opacity: { duration: 0.5 },
            filter: { duration: 0.5 },
            scale: {
              type: "spring",
              stiffness: 120,
              damping: 20,
              mass: 0.8,
            },
            y: {
              type: "spring",
              damping: 8,
              stiffness: 150,
              mass: 2.5,
            },
            pointerEvents: { duration: 0 },
          }}
        >
          <div className="w-full max-w-4xl px-4">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={step === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h2
                className="text-foreground mb-2 text-2xl font-bold sm:text-3xl md:text-4xl"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
              >
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={
                    step === 2
                      ? { opacity: 1, filter: "blur(0px)" }
                      : { opacity: 0, filter: "blur(10px)" }
                  }
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline"
                >
                  Selectează{" "}
                </motion.span>
                <span className="inline-block whitespace-nowrap">
                  <motion.span
                    className="inline"
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={
                      step === 2
                        ? { opacity: 1, filter: "blur(0px)" }
                        : { opacity: 0, filter: "blur(10px)" }
                    }
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    primaria<span style={{ color: "oklch(0.712 0.194 13.428)" }}>Ta</span>
                  </motion.span>
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      step2HeartbeatActive
                        ? {
                            opacity: 1,
                            scale: [
                              1, 1.15, 1, 1.12, 1, 1, 1.15, 1, 1.12, 1, 1, 1.15, 1, 1.12, 1, 1,
                              1.15, 1, 1.12, 1,
                            ],
                          }
                        : step === 2
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.5 }
                    }
                    transition={
                      step2HeartbeatActive
                        ? {
                            scale: {
                              duration: 8,
                              times: [
                                0, 0.0125, 0.025, 0.0375, 0.05, 0.25, 0.2625, 0.275, 0.2875, 0.3,
                                0.5, 0.5125, 0.525, 0.5375, 0.55, 0.75, 0.7625, 0.775, 0.7875, 0.8,
                              ],
                              ease: "easeOut",
                              repeat: 0,
                            },
                            opacity: {
                              duration: 0.3,
                            },
                          }
                        : {
                            delay: step === 2 ? 1.0 : 0,
                            duration: 0.3,
                            ease: "easeOut" as const,
                          }
                    }
                  >
                    ❤️
                  </motion.span>
                  <motion.span
                    className="inline"
                    initial={{ opacity: 0 }}
                    animate={step === 2 ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
                    transition={{
                      delay: 1.0,
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: "loop",
                      times: [0, 0.1, 0.9, 1],
                    }}
                  >
                    _
                  </motion.span>
                </span>
              </h2>
              <p
                className="text-muted-foreground text-sm sm:text-base"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
              >
                Alege județul și localitatea pentru a continua
              </p>
            </motion.div>

            {/* Location Wheel Picker Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={step === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
            >
              <LocationWheelPickerForm
                onSubmit={handleLocationSubmit}
                onSearchInputChange={(length) => setSearchInputLength(length)}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

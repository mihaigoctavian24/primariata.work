"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import CountUp from "@/components/ui/CountUp";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocationWheelPickerForm } from "@/components/location/LocationWheelPickerForm";
import { saveLocation } from "@/lib/location-storage";
import { GridOverlay } from "@/components/ui/GridOverlay";
import { HyperText } from "@/components/ui/HyperText";

/**
 * Hero Section Component for Landing Page - Multi-Step Flow
 *
 * STEP 1: Welcome screen with static logo, subtitle, button, stats (all visible immediately)
 * STEP 2: Location selection with wheel pickers
 * → After STEP 2: Redirect to /auth/login (auth required)
 *
 * Features:
 * - Static logo "primariaTa❤️" with "Ta" colored
 * - Immediate display of subtitle, CTA button, and stats (no cascade)
 * - CountUp animations for stats (start immediately)
 * - Hover/tap animations on CTA button
 * - Blur animations between steps
 * - Fully responsive (375px - 1920px)
 * - WCAG 2.1 AA accessible
 * - 60 FPS animations
 * - Zero layout shifts (CLS = 0)
 */

interface HeroSectionProps {
  scrollContainer?: React.RefObject<HTMLElement>;
}

export function HeroSection({ scrollContainer }: HeroSectionProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step2HeartbeatActive, setStep2HeartbeatActive] = useState(false);
  const [searchInputLength, setSearchInputLength] = useState(0);

  // State for Ta/Mea/Noastră cycling animation
  const [taText, setTaText] = useState<"Ta" | "Mea" | "Noastră">("Ta");
  const [triggerAnimation, setTriggerAnimation] = useState(0);
  const [heartTargetX, setHeartTargetX] = useState<number | null>(null);
  const [finalTextWidths, setFinalTextWidths] = useState<Record<"Ta" | "Mea" | "Noastră", number>>({
    Ta: 0,
    Mea: 0,
    Noastră: 0,
  });
  const [scrambleMaxWidths, setScrambleMaxWidths] = useState<
    Record<"Ta" | "Mea" | "Noastră", number>
  >({
    Ta: 0,
    Mea: 0,
    Noastră: 0,
  });

  // Refs for dynamic button positioning
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonTargetY, setButtonTargetY] = useState(200); // Default placeholder
  const taTextRef = useRef<HTMLDivElement>(null);
  const hyperTextRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic button position to move to stats zone + 40px extra
  useEffect(() => {
    if (statsRef.current && buttonRef.current && step === 2) {
      const statsRect = statsRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const targetY = statsRect.top - buttonRect.top + 40; // +40px extra offset
      setButtonTargetY(targetY);
    }
  }, [step]);

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

  // PRE-CALCULATE all text widths ONCE on mount (after fonts load)
  useEffect(() => {
    // Wait for fonts to load
    const timer = setTimeout(() => {
      if (!hyperTextRef.current) return;

      const measureText = (text: string, uppercase = false) => {
        const measureSpan = document.createElement("span");
        measureSpan.style.visibility = "hidden";
        measureSpan.style.position = "absolute";
        measureSpan.style.whiteSpace = "nowrap";
        measureSpan.style.fontSize = getComputedStyle(hyperTextRef.current!).fontSize;
        measureSpan.style.fontFamily = getComputedStyle(hyperTextRef.current!).fontFamily;
        measureSpan.style.fontWeight = getComputedStyle(hyperTextRef.current!).fontWeight;
        measureSpan.textContent = uppercase ? text.toUpperCase() : text;

        document.body.appendChild(measureSpan);
        const width = measureSpan.getBoundingClientRect().width;
        document.body.removeChild(measureSpan);

        return width;
      };

      const SCRAMBLE_PADDING = 20;

      // Calculate FINAL widths (lowercase, as they appear after scramble)
      const finalWidths = {
        Ta: measureText("Ta", false),
        Mea: measureText("Mea", false),
        Noastră: measureText("Noastră", false),
      };

      // Calculate MAX widths during scramble (uppercase + padding)
      const maxWidths = {
        Ta: measureText("Ta", true) + SCRAMBLE_PADDING,
        Mea: measureText("Mea", true) + SCRAMBLE_PADDING,
        Noastră: measureText("Noastră", true) + SCRAMBLE_PADDING,
      };

      setFinalTextWidths(finalWidths);
      setScrambleMaxWidths(maxWidths);

      // Set initial position for "Ta"
      setHeartTargetX(finalWidths.Ta);
    }, 200); // Wait for fonts

    return () => clearTimeout(timer);
  }, []); // Run ONCE on mount

  // Cycling Ta → Mea → Noastră animation with choreographed sequence
  useEffect(() => {
    if (step !== 1) return;
    if (Object.values(finalTextWidths).some((w) => w === 0)) return; // Wait for calculations

    const cycleInterval = setInterval(() => {
      setTaText((current) => {
        const nextText = current === "Ta" ? "Mea" : current === "Mea" ? "Noastră" : "Ta";

        // Phase 1: Move heart to SCRAMBLE position (max width + padding)
        setHeartTargetX(scrambleMaxWidths[nextText]);

        // Phase 2: Start scramble after short delay (200ms)
        setTimeout(() => {
          setTaText(nextText);
          setTriggerAnimation((prev) => prev + 1);

          // Phase 3: After scramble completes (~800ms), retract heart to CALCULATED final position
          setTimeout(() => {
            setHeartTargetX(finalTextWidths[nextText]);
          }, 800); // Duration of scramble animation
        }, 200);

        return current; // Keep current text for now
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(cycleInterval);
  }, [step, finalTextWidths, scrambleMaxWidths]);

  const stats = [
    {
      value: "13,851",
      label: "Localități",
      countUp: { from: 0, to: 13851, direction: "up" as const, separator: "," },
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
    {
      value: "0",
      label: "Cozi",
      countUp: { from: 0, to: 100, direction: "down" as const },
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
      className="relative flex h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Hero section - Pagina principală Primăriata"
    >
      {/* Grid Overlay - Development tool */}
      <GridOverlay scrollContainer={scrollContainer} />

      {/* Theme Toggle - fixed in top right */}
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Multi-Step Flow - All elements present, controlled by animations */}
      <div className="grid-container relative h-full">
        {/* Logo "primaria" blur wrapper (Layer 1: Background z-10) - responds to step - ALIGNED TO COL 6 */}
        <motion.div
          className="absolute top-[38%] z-10 col-start-6 -translate-y-1/2"
          style={{ marginLeft: "-8px" }}
          initial={{ opacity: 1, filter: "blur(0px)" }}
          animate={
            step === 2
              ? { opacity: 0.3, filter: "blur(20px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <HyperText
            className="text-foreground text-[4.5rem] font-medium sm:text-[7.5rem] md:text-[9rem] lg:text-[10.5rem]"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))" }}
            duration={1000}
            delay={300}
            startOnView={false}
            animateOnHover={false}
          >
            primaria
          </HyperText>
        </motion.div>

        {/* Logo "Ta❤️" blur wrapper (Layer 1: Background z-10) - responds to step - ALIGNED TO COL 6 */}
        <motion.div
          className="absolute top-[38%] z-10 col-start-6"
          style={{
            marginTop: "5rem",
            marginLeft: taText === "Ta" ? "-1px" : "-10px",
          }}
          initial={{ opacity: 1, filter: "blur(0px)" }}
          animate={
            step === 2
              ? { opacity: 0.3, filter: "blur(20px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div
            className="leading-none font-medium tracking-tight"
            style={{
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))",
              position: "relative",
              display: "inline-block",
            }}
          >
            <span
              ref={taTextRef}
              style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <span ref={hyperTextRef} style={{ display: "inline-block" }}>
                <HyperText
                  key={triggerAnimation}
                  className="text-[4.5rem] sm:text-[7.5rem] md:text-[9rem] lg:text-[10.5rem]"
                  style={{ color: "#BE3144" }}
                  duration={800}
                  delay={0}
                  startOnView={false}
                  animateOnHover={false}
                >
                  {taText}
                </HyperText>
              </span>
              {heartTargetX !== null && (
                <motion.span
                  className="text-[4.5rem] sm:text-[7.5rem] md:text-[9rem] lg:text-[10.5rem]"
                  style={{
                    display: "inline-block",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                  }}
                >
                  <Image
                    src="/vector_heart.svg"
                    alt="❤️"
                    width={72}
                    height={72}
                    className="inline-block"
                    style={{ width: "1em", height: "1em" }}
                  />
                </motion.span>
              )}
            </span>
          </div>
        </motion.div>

        {/* Subtitle (Layer 2: Middle z-20) - ALIGNED TO COL 6 */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={
            step === 2
              ? { opacity: 0, y: 0 } // Fade out on STEP 2
              : { opacity: 1, y: 0 } // Visible on STEP 1
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute top-[66%] z-20 col-start-6"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
        >
          <p className="text-muted-foreground font-montreal text-[0.9rem] font-medium sm:text-[1rem] md:text-[1.2rem] lg:text-[1.44rem]">
            Bine ai venit la Primăria ta digitală.
          </p>
          <p className="text-muted-foreground font-montreal mt-2 text-[0.8rem] font-medium opacity-90 sm:text-[0.9rem] md:text-[1rem]">
            Servicii publice online,
            <br />
            fără cozi,
            <br />
            24/7.
          </p>
        </motion.div>

        {/* Content container - appears below logo and subtitle */}
        <div className="relative col-span-12 pt-[80vh] text-center">
          {/* CTA Button (Layer 4: Top z-40) - moves down in STEP 2, always clickable */}
          <motion.div
            ref={buttonRef}
            initial={{ opacity: 1, y: 0 }}
            animate={
              step === 2
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
              className="ring-offset-background font-montreal inline-flex h-12 min-w-[200px] items-center justify-center rounded-full px-8 text-base font-normal shadow-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-14 sm:px-10 sm:text-lg"
              style={{
                backgroundColor: "#BE3144",
                color: "#FFFFFF",
                textShadow:
                  "3px 3px 6px rgba(0, 0, 0, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.3)",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                colorScheme: "dark",
                opacity: 1,
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
                className="font-montreal text-muted-foreground text-sm"
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

          {/* Stats Section (Layer 2: Middle z-20) - Positioned in column 1 */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 1, y: 0 }}
            animate={
              step === 2
                ? { opacity: 0, y: 0, filter: "blur(20px)", scale: 0.8 } // Blur out and disappear on STEP 2
                : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } // Visible on STEP 1
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-0 z-20 col-start-1 flex flex-col"
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              rowGap: "4px",
              columnGap: "0",
              marginLeft: "-8.33%",
              marginTop: "3rem",
            }}
          >
            {stats.map((stat) => (
              <React.Fragment key={stat.label}>
                <span
                  className="font-montreal text-foreground text-[0.7rem] font-normal uppercase sm:text-[0.75rem] md:text-[0.8rem]"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    justifySelf: "end",
                    letterSpacing: "1em",
                    marginRight: "calc(0.6rem - 1em)",
                  }}
                >
                  {stat.label}
                </span>
                <span
                  className="text-foreground text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem]"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    justifySelf: "end",
                  }}
                >
                  :
                </span>
                {stat.countUp ? (
                  // Check if countUp has parts (for 24/7 case)
                  "parts" in stat.countUp && stat.countUp.parts ? (
                    <span
                      className="font-montreal text-foreground text-[0.7rem] font-normal sm:text-[0.75rem] md:text-[0.8rem]"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                        justifySelf: "start",
                        display: "inline-flex",
                        gap: "0",
                        marginLeft: "0.5rem",
                      }}
                    >
                      <span style={{ minWidth: "2ch", textAlign: "right" }}>
                        {
                          stat.countUp.parts.map((part, idx) => {
                            if (part.type === "static") {
                              return null; // Skip static parts in first group
                            }
                            return (
                              <CountUp
                                key={idx}
                                from={part.from}
                                to={part.to}
                                direction="up"
                                duration={2}
                                delay={0}
                                startWhen={true}
                              />
                            );
                          })[0]
                        }
                      </span>
                      {stat.countUp.parts
                        .filter((p) => p.type === "static")
                        .map((part, idx) => (
                          <span key={`static-${idx}`}>{part.value}</span>
                        ))}
                      {stat.countUp.parts.map((part, idx) => {
                        if (part.type === "static" || idx === 0) {
                          return null; // Skip static and first countup
                        }
                        return (
                          <CountUp
                            key={idx}
                            from={part.from}
                            to={part.to}
                            direction="up"
                            duration={2}
                            delay={0}
                            startWhen={true}
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
                      delay={0}
                      className="font-montreal text-foreground text-[0.7rem] font-normal sm:text-[0.75rem] md:text-[0.8rem]"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                        justifySelf: "start",
                        marginLeft: "0.5rem",
                      }}
                      startWhen={true}
                    />
                  )
                ) : (
                  <span
                    className="text-foreground text-sm font-normal sm:text-base md:text-lg"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      justifySelf: "start",
                    }}
                  >
                    {stat.value}
                  </span>
                )}
              </React.Fragment>
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
                    primaria<span style={{ color: "#BE3144" }}>Ta</span>
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
                    <Image
                      src="/vector_heart.svg"
                      alt="❤️"
                      width={36}
                      height={36}
                      className="inline-block"
                      style={{ width: "1em", height: "1em" }}
                    />
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

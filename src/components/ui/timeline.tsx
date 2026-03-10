"use client";

import { useMotionValueEvent, useScroll, useSpring, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/ui/HeartIcon";

interface TimelineEntry {
  title: string;
  header: React.ReactNode | ((revealed: boolean) => React.ReactNode);
  images: React.ReactNode;
  description: React.ReactNode | ((revealed: boolean) => React.ReactNode) | null;
}

// Component for individual timeline item with scroll-based image animations
function TimelineItemContent({
  header,
  images,
  description,
  scrollContainer,
}: {
  header: React.ReactNode | ((revealed: boolean) => React.ReactNode);
  images: React.ReactNode;
  description: React.ReactNode | ((revealed: boolean) => React.ReactNode) | null;
  scrollContainer?: React.RefObject<HTMLElement>;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Detect mobile (< 768px) on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: itemRef,
    container: scrollContainer,
    offset: isMobile ? ["start 70%", "end start"] : ["start 80%", "end start"],
  });

  // Toggle revealed based on scroll threshold (reversible)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const threshold = isMobile ? 0.55 : 0.35;
    if (!revealed && latest >= threshold) setRevealed(true);
    if (revealed && latest < threshold - 0.05) setRevealed(false);
  });

  // Phase 1: rotateX 90deg → 0deg (flat to upright) - earlier on MOBILE ONLY
  const rotateXBase = useTransform(scrollYProgress, isMobile ? [0.2, 0.5] : [0.0, 0.25], [90, 0]);
  const rotateX = useSpring(rotateXBase, { stiffness: 120, damping: 14, mass: 1 });

  // Phase 2: scale up - happens after flip starts (limited to 1.16 max, shrinks to 0.936) - earlier on MOBILE ONLY
  const scale = useTransform(
    scrollYProgress,
    isMobile ? [0.3, 0.55, 0.65] : [0.1, 0.3, 0.4],
    [0.8, 1.16, 1]
  );

  // Phase 3: translateY (move up) - earlier on MOBILE ONLY
  const translateY = useTransform(scrollYProgress, isMobile ? [0.6, 0.8] : [0.5, 0.7], [0, -50]);

  // Header animation - emerges as image reaches full expansion - earlier on MOBILE ONLY
  const headerOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.3, 0.55] : [0.15, 0.35],
    [0, 1]
  );
  const headerTranslateY = useTransform(
    scrollYProgress,
    isMobile ? [0.3, 0.55] : [0.15, 0.35],
    [20, 0]
  );

  // Description opacity (appears together with header) - earlier on MOBILE ONLY
  const descriptionOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.3, 0.55] : [0.15, 0.35],
    [0, 1]
  );

  // Image fade-in effect (starts earlier, smooth appearance) - earlier on MOBILE ONLY
  const imageOpacity = useTransform(scrollYProgress, isMobile ? [0.1, 0.4] : [0.0, 0.2], [0, 1]);

  const headerContent = typeof header === "function" ? header(revealed) : header;
  const descContent = typeof description === "function" ? description(revealed) : description;

  return (
    <div ref={itemRef} className="relative z-10 w-full pr-4 pl-20 md:pl-4">
      {/* Animated wrapper for images and content */}
      <motion.div
        style={{
          perspective: "1000px",
        }}
      >
        {/* Images container with 3D animations */}
        <motion.div
          style={{
            rotateX,
            scale,
            translateY,
            opacity: imageOpacity,
            transformStyle: "preserve-3d",
          }}
          className="mb-8"
        >
          {images}
        </motion.div>

        {/* Header emerges as image expands */}
        <motion.div
          style={{
            opacity: headerOpacity,
            translateY: headerTranslateY,
          }}
        >
          {headerContent}
        </motion.div>

        {/* Description that fades in at the end */}
        {descContent && (
          <motion.div
            style={{
              opacity: descriptionOpacity,
            }}
          >
            {descContent}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export const Timeline = ({
  data,
  scrollContainer,
}: {
  data: TimelineEntry[];
  scrollContainer?: React.RefObject<HTMLElement>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    };

    updateHeight();

    // Recalculate height on window resize
    window.addEventListener("resize", updateHeight);

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(updateHeight);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainer,
    offset: ["start 10%", "end 100%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const totalEntries = data.length;
    const index = Math.min(Math.floor(latest * totalEntries), totalEntries - 1);
    setActiveIndex(index);
  });

  return (
    <div className="w-full bg-transparent font-sans md:px-10" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 lg:px-10">
        <h2 className="font-montreal-medium text-foreground mb-4 max-w-4xl text-3xl font-bold md:text-6xl">
          De ce primăria<span className="text-primary">Ta</span>
          <HeartIcon
            className="text-primary inline-block"
            style={{ width: "1em", height: "1em" }}
          />
          ?
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm md:text-base">
          Platformă SaaS white-label care digitalizează complet procesele administrative locale
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-60">
        {data.map((item, index) => {
          const isActive = activeIndex >= index;
          return (
            <div key={index} className="flex justify-start pt-48 md:gap-10 md:pt-40">
              <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
                <div className="timeline-dot-outer bg-background absolute left-3 flex h-10 w-10 items-center justify-center rounded-full md:left-3">
                  <motion.div
                    className={`h-4 w-4 rounded-full border p-2 transition-colors duration-300 ${
                      isActive ? "bg-primary border-primary" : "bg-muted border-border"
                    }`}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <h3 className="font-montreal-medium hidden text-xl text-neutral-400 md:block md:pl-20 md:text-5xl dark:text-neutral-700">
                  {item.title}
                </h3>
              </div>

              <TimelineItemContent
                header={
                  typeof item.header === "function" ? (
                    (revealed) => (
                      <>
                        <h3 className="font-montreal-medium mb-4 block text-left text-2xl text-neutral-400 md:hidden dark:text-neutral-700">
                          {item.title}
                        </h3>
                        {(item.header as (revealed: boolean) => React.ReactNode)(revealed)}
                      </>
                    )
                  ) : (
                    <>
                      <h3 className="font-montreal-medium mb-4 block text-left text-2xl text-neutral-400 md:hidden dark:text-neutral-700">
                        {item.title}
                      </h3>
                      {item.header}
                    </>
                  )
                }
                images={item.images}
                description={item.description}
                scrollContainer={scrollContainer}
              />
            </div>
          );
        })}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="from-primary via-primary/60 absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t to-transparent"
          />
        </div>
      </div>
    </div>
  );
};

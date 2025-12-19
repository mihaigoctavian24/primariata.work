"use client";

import { useMotionValueEvent, useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface TimelineEntry {
  title: string;
  header: React.ReactNode;
  images: React.ReactNode;
  description: React.ReactNode | null;
}

// Component for individual timeline item with scroll-based image animations
function TimelineItemContent({
  header,
  images,
  description,
  scrollContainer,
}: {
  header: React.ReactNode;
  images: React.ReactNode;
  description: React.ReactNode | null;
  scrollContainer?: React.RefObject<HTMLElement>;
}) {
  const itemRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: itemRef,
    container: scrollContainer,
    offset: ["start 70%", "end start"],
  });

  // Phase 1: rotateX 90deg → 0deg (flat to upright) - starts earlier on mobile
  const rotateX = useTransform(scrollYProgress, [0.2, 0.5], [90, 0]);

  // Phase 2: scale up - happens after flip starts (limited to 1.16 max, shrinks to 0.936)
  const scale = useTransform(scrollYProgress, [0.3, 0.55, 0.65], [0.8, 1.16, 1]);

  // Phase 3: translateY (move up) - starts earlier
  const translateY = useTransform(scrollYProgress, [0.6, 0.8], [0, -50]);

  // Header animation - emerges as image reaches full expansion
  const headerOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
  const headerTranslateY = useTransform(scrollYProgress, [0.3, 0.55], [20, 0]);

  // Description opacity (appears together with header)
  const descriptionOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);

  // Image fade-in effect (starts earlier, smooth appearance)
  const imageOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  return (
    <div ref={itemRef} className="relative w-full pr-4 pl-20 md:pl-4">
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
          {header}
        </motion.div>

        {/* Description that fades in at the end */}
        {description && (
          <motion.div
            style={{
              opacity: descriptionOpacity,
            }}
          >
            {description}
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
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
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
        <h2 className="font-montreal-medium mb-4 max-w-4xl text-3xl font-bold text-white md:text-6xl dark:text-gray-900">
          De ce primăria<span className="text-[#BE3144]">Ta</span>
          <Image
            src="/vector_heart.svg"
            alt="❤️"
            width={28}
            height={28}
            className="inline-block"
            style={{ width: "1em", height: "1em" }}
          />
          ?
        </h2>
        <p className="max-w-sm text-sm text-gray-400 md:text-base dark:text-gray-700">
          Platformă SaaS white-label care digitalizează complet procesele administrative locale
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-60">
        {data.map((item, index) => {
          const isActive = activeIndex >= index;
          return (
            <div key={index} className="flex justify-start pt-48 md:gap-10 md:pt-40">
              <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
                <div className="timeline-dot-outer absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white md:left-3 dark:bg-black">
                  <motion.div
                    className="h-4 w-4 rounded-full border p-2"
                    initial={{ backgroundColor: "rgb(229, 229, 229)" }}
                    animate={{
                      backgroundColor: isActive ? "rgb(190, 49, 68)" : "rgb(229, 229, 229)",
                      borderColor: isActive ? "rgb(190, 49, 68)" : "rgb(212, 212, 212)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <h3 className="font-montreal-medium hidden text-xl text-neutral-400 md:block md:pl-20 md:text-5xl dark:text-neutral-700">
                  {item.title}
                </h3>
              </div>

              <TimelineItemContent
                header={
                  <>
                    <h3 className="font-montreal-medium mb-4 block text-left text-2xl text-neutral-400 md:hidden dark:text-neutral-700">
                      {item.title}
                    </h3>
                    {item.header}
                  </>
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
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-[#BE3144] from-[0%] via-[#EF4444] via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  );
};

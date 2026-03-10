"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const DEFAULT_CHARACTER_SET =
  "AĂÂBCDEÉFGHIÎJKLMNOPQRȘȚUVWXYZaăâbcdefghiîjklmnopqrsștuvwxyz0123456789";

interface TextScrambleProps extends MotionProps {
  children: string;
  trigger?: boolean;
  speed?: number;
  duration?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  onScrambleComplete?: () => void;
}

export function TextScramble({
  children,
  trigger = false,
  speed = 0.04,
  duration = 0.8,
  characterSet = DEFAULT_CHARACTER_SET,
  as: Component = "span",
  className,
  onScrambleComplete,
  ...motionProps
}: TextScrambleProps) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayText, setDisplayText] = useState(children);
  const prevTrigger = useRef(trigger);
  const frameRef = useRef<number>(0);

  // Sync displayText with children when trigger is off
  useEffect(() => {
    if (!trigger) {
      setDisplayText(children);
    }
  }, [children, trigger]);

  useEffect(() => {
    // Trigger turned ON → scramble in (reveal)
    if (trigger && !prevTrigger.current) {
      prevTrigger.current = true;
      cancelAnimationFrame(frameRef.current);

      const text = children;
      const totalChars = text.length;
      const durationMs = duration * 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const revealedCount = Math.floor(progress * totalChars);

        const result = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealedCount) return char;
            return characterSet[Math.floor(Math.random() * characterSet.length)];
          })
          .join("");

        setDisplayText(result);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(text);
          onScrambleComplete?.();
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }

    // Trigger turned OFF → scramble out (hide back to scrambled then original)
    if (!trigger && prevTrigger.current) {
      prevTrigger.current = false;
      cancelAnimationFrame(frameRef.current);

      const text = children;
      const totalChars = text.length;
      const durationMs = duration * 1000 * 0.5; // reverse is faster
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Reverse: revealed chars shrink from end to start
        const revealedCount = Math.floor((1 - progress) * totalChars);

        const result = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealedCount) return char;
            return characterSet[Math.floor(Math.random() * characterSet.length)];
          })
          .join("");

        setDisplayText(result);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(children);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [trigger, children, duration, characterSet, onScrambleComplete]);

  return (
    <MotionComponent className={cn(className)} {...motionProps}>
      {displayText}
    </MotionComponent>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.55, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageFade({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Kindsight Score Circle component:
 * 120px diameter circle with 6-7px stroke, #e5e1d6 warm sand track,
 * #e1f079 chartreuse arc starting from top, Playfair numeral in center.
 */
export function ScoreCircle({
  value,
  max = 100,
  suffix = "%",
  label,
  size = 120,
}: {
  value: number;
  max?: number;
  suffix?: string;
  label: string;
  size?: number;
}) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(value, max));
  const ratio = max > 0 ? clamped / max : 0;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - ratio);

  return (
    <div className="flex flex-col items-start gap-3">
      <div
        className="relative grid place-items-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e1d6"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e1f079"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={
              reducedMotion
                ? { strokeDashoffset: targetOffset }
                : { strokeDashoffset: circumference }
            }
            whileInView={{ strokeDashoffset: targetOffset }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.9, delay: 0.15, ease: EDITORIAL_EASE }}
          />
        </svg>
        <span className="font-editorial tabular-nums absolute text-[34px] leading-none tracking-[-0.04em] text-[#0e0f0a]">
          {clamped}
          {suffix ? <span className="text-[18px]">{suffix}</span> : null}
        </span>
      </div>
      <p className="text-[13px] leading-[1.35] text-[#0e0f0a]/75 max-w-[160px]">
        {label}
      </p>
    </div>
  );
}

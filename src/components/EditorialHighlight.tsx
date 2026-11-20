"use client";

import { motion, useReducedMotion } from "motion/react";

type EditorialHighlightProps = {
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Kindsight's signature typographic gesture:
 * One italicized display word underlined by a hand-drawn chartreuse (#e1f079) stroke.
 * On light cream surfaces, ink remains #0e0f0a with chartreuse stroke.
 * On dark olive surfaces, both italic word and stroke glow in #e1f079.
 */
export default function EditorialHighlight({
  children,
  variant = "light",
  className = "",
}: EditorialHighlightProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      className={`relative inline-block italic ${
        variant === "dark" ? "text-[#e1f079]" : "text-[#0e0f0a]"
      } ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 220 22"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.14em] left-[-2%] z-0 h-[0.22em] w-[104%] overflow-visible"
      >
        <motion.path
          d="M 4 14 Q 58 6, 112 12 T 216 9"
          fill="none"
          stroke="#e1f079"
          strokeWidth="6.5"
          strokeLinecap="round"
          initial={reducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.4 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.72, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
}

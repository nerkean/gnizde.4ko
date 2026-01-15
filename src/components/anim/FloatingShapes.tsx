"use client";

import { motion } from "framer-motion";

export default function FloatingShapes() {
  const blob = (delay: number, size = 280) => (
    <motion.div
      key={delay}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.55, scale: 1 }}
      transition={{ duration: 1.2, delay }}
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(ellipse at center, rgba(161,199,113,0.35), rgba(161,199,113,0) 60%)",
      }}
    />
  );

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-16">{blob(0)}</div>
      <div className="absolute -bottom-20 -right-10">{blob(0.2, 320)}</div>
      <div className="absolute top-1/3 -right-24">
        <motion.div
          className="h-64 w-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,215,130,0.35), rgba(255,215,130,0) 60%)",
          }}
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

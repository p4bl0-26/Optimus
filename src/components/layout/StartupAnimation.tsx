'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Core Ignite (0.0s)
    // Phase 2: Assembly (0.8s)
    const t1 = setTimeout(() => setPhase(1), 800);
    // Phase 3: Eye Glow & Pulse (1.8s)
    const t2 = setTimeout(() => setPhase(2), 1800);
    // Phase 4: Text Reveal (2.4s)
    const t3 = setTimeout(() => setPhase(3), 2400);
    // Phase 5: Fade Out (3.0s)
    const t4 = setTimeout(() => {
      setPhase(4);
      setTimeout(onComplete, 500); // Wait for fade out
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Background ambient glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,112,243,0.15)_0%,rgba(0,0,0,1)_70%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1 }}
      />

      {/* Grid / Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,112,243,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,112,243,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="relative w-[500px] h-[500px] flex items-center justify-center">
        {/* Energy Core Ignite (0.0 - 0.8s) */}
        <AnimatePresence>
          {phase === 0 && (
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-[var(--color-accent-primary)]"
              style={{ filter: 'blur(10px)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 0.5], opacity: [0, 1, 0.8] }}
              exit={{ scale: 10, opacity: 0, filter: 'blur(30px)' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Mechanical Rings Assembly */}
        {phase >= 1 && (
          <>
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full border border-[var(--color-accent-primary)]/30 border-t-[var(--color-accent-primary)] border-b-[var(--color-accent-primary)]"
              initial={{ scale: 2, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "circOut" }}
            />
            <motion.div
              className="absolute w-[320px] h-[320px] rounded-full border-2 border-dashed border-[var(--color-accent-primary)]/20"
              initial={{ scale: 0.5, rotate: 180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 0.5 }}
              transition={{ duration: 1.2, ease: "circOut" }}
            />
          </>
        )}

        {/* The Emblem / Logo */}
        {/* We use object-cover and clip-path to isolate the top portion (the emblem) from the text for phases 1-3 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8, filter: 'brightness(0) blur(10px)' }}
          animate={{ 
            opacity: phase >= 1 ? 1 : 0, 
            scale: phase >= 1 ? 1 : 0.8,
            filter: phase >= 2 ? 'brightness(1) blur(0px)' : (phase >= 1 ? 'brightness(0.3) blur(2px)' : 'brightness(0) blur(10px)')
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ clipPath: phase < 3 ? 'inset(0% 0% 30% 0%)' : 'inset(0% 0% 0% 0%)' }} // Hide text until phase 3
        >
          <img 
            src="/optimus-logo.png" 
            alt="OPTIMUS Logo" 
            className="w-full h-full object-contain mix-blend-screen"
          />
        </motion.div>

        {/* Energy Pulse (1.8s) */}
        {phase === 2 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--color-accent-primary)] mix-blend-screen"
            initial={{ scale: 0.5, opacity: 0.8, filter: 'blur(20px)' }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}

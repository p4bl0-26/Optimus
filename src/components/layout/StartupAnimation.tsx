'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [
      setTimeout(() => setPhase(1), 500),   // Scene 1: Logo fade & scale in
      setTimeout(() => setPhase(2), 1500),  // Scene 2: Energy Pulse / Shockwave
      setTimeout(() => setPhase(3), 2200),  // Scene 3: Typography appears
      setTimeout(() => {
        setPhase(4); // Fade out
        setTimeout(onComplete, 800);
      }, 4500)
    ];
    return () => timings.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center w-full h-[400px] z-10">
        
        {/* Logo Reveal */}
        <motion.div
          className="absolute z-20"
          initial={{ opacity: 0, scale: 0.8, filter: 'brightness(2) blur(10px)' }}
          animate={
            phase >= 1 
              ? { opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' } 
              : { opacity: 0, scale: 0.8, filter: 'brightness(2) blur(10px)' }
          }
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Image 
            src="/optimus-logo.png" 
            alt="OPTIMUS Logo" 
            width={350}
            height={350}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Energy Pulse / Shockwave */}
        {phase === 2 && (
          <motion.div
            className="absolute z-30 rounded-full border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 mix-blend-screen pointer-events-none"
            style={{ width: 150, height: 150 }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 4, opacity: 0, borderWidth: "0px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Typography (Final Hero Shot) */}
      <div className="absolute bottom-16 flex flex-col items-center justify-center text-center w-full z-20">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white tracking-[0.35em] font-orbitron uppercase mb-3"
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={phase >= 3 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          OPTIMUS
        </motion.h1>
        
        <motion.p
          className="text-[12px] md:text-[14px] font-mono text-[var(--color-accent-primary)] tracking-[0.4em] uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Your AI Chief of Staff
        </motion.p>

        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <p className="text-[10px] md:text-xs text-zinc-500 font-light tracking-widest italic" style={{ letterSpacing: '0.2em' }}>
            &quot;AI ACTS FIRST. HUMANS APPROVE.&quot;
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

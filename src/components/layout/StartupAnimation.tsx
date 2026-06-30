'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [
      setTimeout(() => setPhase(1), 100),   // Scene 1: Logo fade & scale in
      setTimeout(() => setPhase(2), 500),   // Scene 2: Energy Pulse / Shockwave
      setTimeout(() => setPhase(3), 800),   // Scene 3: Typography orchestrations begin
      setTimeout(() => {
        setPhase(4); // Fade out
        setTimeout(onComplete, 500);
      }, 2000) // Whole animation finishes at 2 seconds
    ];
    return () => timings.forEach(clearTimeout);
  }, [onComplete]);

  const optimusLetters = "OPTIMUS".split('');

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: 0.8 
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 6, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.2, ease: "easeOut" as const } 
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Adjusted height so typography can sit right beneath the logo */}
      <div className="relative flex items-center justify-center w-full h-[250px] z-10">
        
        {/* Logo Reveal */}
        <motion.div
          className="absolute z-20"
          initial={{ opacity: 0, scale: 0.8, filter: 'brightness(2) blur(10px)' }}
          animate={
            phase >= 1 
              ? { opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' } 
              : { opacity: 0, scale: 0.8, filter: 'brightness(2) blur(10px)' }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
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
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Typography (Final Hero Shot) - Relative positioning to sit right beneath logo */}
      <div className="relative mt-2 flex flex-col items-center justify-center text-center w-full z-20">
        
        {/* Letter-by-letter OPTIMUS */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white tracking-[0.35em] font-orbitron uppercase mb-3 flex items-center justify-center"
          variants={containerVariants}
          initial="hidden"
          animate={phase >= 3 ? "visible" : "hidden"}
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          {optimusLetters.map((letter, index) => (
            <div key={index} className="relative inline-flex items-center justify-center">
              <motion.span 
                variants={letterVariants}
                className="relative z-10"
              >
                {letter}
              </motion.span>
              
              {/* Subtle green energy pulse & dissolving particles effect behind each letter */}
              <motion.div
                className="absolute inset-0 z-0 bg-[var(--color-accent-primary)] rounded-full mix-blend-screen blur-[8px]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={phase >= 3 ? { opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + (index * 0.05), ease: "easeOut" }}
              />
            </div>
          ))}
        </motion.h1>
        
        {/* Left-to-right scanning reveal for subtitle */}
        <motion.p
          className="text-[12px] md:text-[14px] font-mono text-[var(--color-accent-primary)] tracking-[0.4em] uppercase mb-8"
          initial={{ clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }}
          animate={phase >= 3 ? { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 } : { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeInOut" }}
        >
          Your AI Chief of Staff
        </motion.p>

        {/* Very subtle fade in for tagline */}
        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <p className="text-[10px] md:text-xs text-zinc-500 font-light tracking-widest italic" style={{ letterSpacing: '0.2em' }}>
            &quot;AI ACTS FIRST. HUMANS APPROVE.&quot;
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

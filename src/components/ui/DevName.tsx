'use client';

import { motion } from 'framer-motion';

interface DevNameProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeConfig = {
  sm: { text: 'text-sm', icon: 'text-xs', particles: 4, glow: '6px' },
  md: { text: 'text-base', icon: 'text-sm', particles: 6, glow: '10px' },
  lg: { text: 'text-xl', icon: 'text-lg', particles: 8, glow: '14px' },
  xl: { text: 'text-2xl lg:text-3xl', icon: 'text-xl', particles: 10, glow: '20px' },
};

export default function DevName({ name, className = '', size = 'md' }: DevNameProps) {
  const s = sizeConfig[size];

  return (
    <span className={`relative inline-flex items-center gap-2 ${s.text} ${className}`}>
      {/* Galaxy background glow */}
      <motion.div
        className="absolute -inset-3 rounded-xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating galaxy ring */}
      <motion.div
        className="absolute -inset-1.5 rounded-lg pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, 
            transparent, 
            rgba(6,182,212,0.5) 10%, 
            transparent 20%,
            rgba(99,102,241,0.4) 30%, 
            transparent 40%,
            rgba(168,85,247,0.3) 50%,
            transparent 60%,
            rgba(6,182,212,0.5) 70%,
            transparent 80%,
            rgba(139,92,246,0.4) 90%,
            transparent
          )`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Lightning icon with pulse */}
      <motion.span
        className={`${s.icon} relative z-10`}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0],
          filter: [
            'drop-shadow(0 0 4px rgba(6,182,212,0.6))',
            'drop-shadow(0 0 12px rgba(6,182,212,0.9))',
            'drop-shadow(0 0 4px rgba(6,182,212,0.6))',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⚡
      </motion.span>

      {/* Name with animated gradient */}
      <motion.span
        className="relative z-10 font-extrabold"
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 25%, #a855f7 50%, #6366f1 75%, #06b6d4 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: `drop-shadow(0 0 ${s.glow} rgba(6,182,212,0.5))`,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 200%', '0% 0%'],
          filter: [
            `drop-shadow(0 0 ${s.glow} rgba(6,182,212,0.5))`,
            `drop-shadow(0 0 ${parseInt(s.glow) * 2}px rgba(139,92,246,0.7))`,
            `drop-shadow(0 0 ${s.glow} rgba(6,182,212,0.5))`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        {name}
      </motion.span>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {[...Array(s.particles)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: ['#06b6d4', '#8b5cf6', '#a855f7', '#6366f1'][i % 4],
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -15 - Math.random() * 10],
              x: [0, (Math.random() - 0.5) * 10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </span>
  );
}

'use client';

import { motion } from 'framer-motion';

interface PremiumNickProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'galaxy' | 'cyber' | 'void' | 'aurora' | 'divine';
}

const sizeConfig = {
  sm: { text: 'text-xs', deco: 'text-[8px]', particles: 3, glow: 4 },
  md: { text: 'text-sm', deco: 'text-[10px]', particles: 5, glow: 8 },
  lg: { text: 'text-lg', deco: 'text-xs', particles: 7, glow: 12 },
  xl: { text: 'text-xl lg:text-2xl', deco: 'text-sm', particles: 10, glow: 18 },
};

const variants = {
  galaxy: {
    gradient: 'linear-gradient(135deg, #c084fc 0%, #818cf8 20%, #60a5fa 40%, #22d3ee 60%, #a78bfa 80%, #c084fc 100%)',
    glow: ['#a855f7', '#818cf8', '#60a5fa', '#22d3ee'],
    decoL: '꧁༺',
    decoR: '༻꧂',
    symbol: '🌌',
  },
  cyber: {
    gradient: 'linear-gradient(135deg, #f0abfc 0%, #e879f9 20%, #c084fc 40%, #a855f7 60%, #d946ef 80%, #f0abfc 100%)',
    glow: ['#e879f9', '#c084fc', '#a855f7', '#d946ef'],
    decoL: '⟨',
    decoR: '⟩',
    symbol: '⟁',
  },
  void: {
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 20%, #e2e8f0 40%, #f1f5f9 50%, #cbd5e1 70%, #94a3b8 100%)',
    glow: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#64748b'],
    decoL: '╰─',
    decoR: '─╮',
    symbol: '◆',
  },
  aurora: {
    gradient: 'linear-gradient(135deg, #34d399 0%, #22d3ee 20%, #60a5fa 40%, #a78bfa 60%, #f472b6 80%, #34d399 100%)',
    glow: ['#34d399', '#22d3ee', '#60a5fa', '#a78bfa'],
    decoL: '⟡',
    decoR: '⟡',
    symbol: '✦',
  },
  divine: {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 20%, #eab308 40%, #fcd34d 60%, #f59e0b 80%, #fbbf24 100%)',
    glow: ['#fbbf24', '#f59e0b', '#eab308', '#fcd34d'],
    decoL: '⚔️',
    decoR: '⚔️',
    symbol: '⚜',
  },
};

export default function PremiumNick({ name, className = '', size = 'md', variant = 'galaxy' }: PremiumNickProps) {
  const s = sizeConfig[size];
  const v = variants[variant];

  return (
    <span className={`relative inline-flex items-center ${s.text} ${className}`}>
      {/* Background aura */}
      <motion.div
        className="absolute -inset-4 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${v.glow[0]}15 0%, ${v.glow[1]}08 40%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating halo ring */}
      <motion.div
        className="absolute -inset-1 rounded-xl pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg,
            transparent,
            ${v.glow[0]}40 8%,
            transparent 16%,
            ${v.glow[1]}35 24%,
            transparent 32%,
            ${v.glow[2]}30 40%,
            transparent 48%,
            ${v.glow[3]}35 56%,
            transparent 64%,
            ${v.glow[0]}40 72%,
            transparent 80%,
            ${v.glow[1]}35 88%,
            transparent
          )`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner content */}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {/* Left decoration */}
        <motion.span
          className={`${s.deco} opacity-60`}
          style={{ color: v.glow[0] }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {v.decoL}
        </motion.span>

        {/* Symbol */}
        <motion.span
          className={`${s.deco} relative`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            filter: [
              `drop-shadow(0 0 3px ${v.glow[0]}80)`,
              `drop-shadow(0 0 8px ${v.glow[1]}bb)`,
              `drop-shadow(0 0 3px ${v.glow[0]}80)`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {v.symbol}
        </motion.span>

        {/* Name */}
        <motion.span
          className="relative font-black tracking-wide"
          style={{
            background: v.gradient,
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            filter: [
              `drop-shadow(0 0 ${s.glow}px ${v.glow[0]}60)`,
              `drop-shadow(0 0 ${s.glow * 2}px ${v.glow[2]}80)`,
              `drop-shadow(0 0 ${s.glow}px ${v.glow[0]}60)`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {name}
        </motion.span>

        {/* Right decoration */}
        <motion.span
          className={`${s.deco} opacity-60`}
          style={{ color: v.glow[2] }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        >
          {v.decoR}
        </motion.span>
      </span>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {[...Array(s.particles)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random()}px`,
              height: `${1 + Math.random()}px`,
              background: v.glow[i % v.glow.length],
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -12 - Math.random() * 8],
              x: [0, (Math.random() - 0.5) * 8],
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              repeat: Infinity,
              delay: i * 0.35,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </span>
  );
}

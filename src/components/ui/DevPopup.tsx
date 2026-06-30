'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoleConfig } from '@/lib/roles';

interface DevPopupProps {
  children: React.ReactNode;
  user: {
    uid?: string;
    displayName: string;
    photoURL?: string;
    role?: string;
    level?: number;
    title?: string;
    totalExp?: number;
    watchTime?: number;
  };
}

export default function DevPopup({ children, user }: DevPopupProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const config = getRoleConfig('dev');

  const handleClick = (e: React.MouseEvent) => {
    if (user.role !== 'dev') return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), 10000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed z-[9999] pointer-events-none"
            style={{ left: pos.x, top: pos.y, transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Flash effect */}
            <motion.div
              className="fixed inset-0 bg-purple-500/5 pointer-events-none z-[-1]"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />

            <div
              className="relative rounded-2xl overflow-hidden pointer-events-auto min-w-[300px] max-w-[90vw]"
              style={{
                background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #2d1b4e 60%, #0a0a1a 100%)',
                border: `2px solid ${config.color}60`,
                boxShadow: `${config.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Galaxy wave background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-[150px] w-[200%]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${['#a78bfa', '#818cf8', '#60a5fa'][i]}30, transparent)`,
                      top: `${15 + i * 30}%`,
                      borderRadius: '50%',
                    }}
                    animate={{ x: ['-25%', '25%', '-25%'] }}
                    transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                  />
                ))}
              </div>

              {/* Stars */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${1 + Math.random() * 2}px`,
                      height: `${1 + Math.random() * 2}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.3, 0.5] }}
                    transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 4 }}
                  />
                ))}
              </div>

              {/* Top glow bar */}
              <motion.div
                className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Content */}
              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-3 rounded-xl"
                      animate={{
                        boxShadow: [
                          `0 0 15px ${config.color}40`,
                          `0 0 30px ${config.color}60`,
                          `0 0 15px ${config.color}40`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2" style={{ borderColor: `${config.color}99` }}>
                      {user.photoURL?.endsWith('.mp4') || user.photoURL?.endsWith('.webm') || user.photoURL?.endsWith('.gif') ? (
                        <video src={user.photoURL} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={user.photoURL || '/images/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${config.color}20, transparent 50%, ${config.color}20)` }} />
                    </div>
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <motion.p
                      className="font-extrabold text-base"
                      style={{
                        background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                      animate={{ backgroundPosition: ['0% 0%', '200% 200%', '0% 0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚡ {user.displayName}
                    </motion.p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ background: `${config.color}20`, color: config.color, borderColor: `${config.color}40` }}>
                        ⚡ DEVELOPER
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: config.color }}>LV. ∞</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <motion.div
                  className="mt-3 px-4 py-2 rounded-lg text-center"
                  style={{ background: `${config.color}10`, border: `1px solid ${config.color}20` }}
                  animate={{ borderColor: [`${config.color}20`, `${config.color}50`, `${config.color}20`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-sm font-extrabold tracking-wider" style={{ color: config.color }}>
                    ⚔️ Penghancur & Pencipta ⚔️
                  </p>
                </motion.div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'UID', value: '33333', icon: '🆔' },
                    { label: 'Level', value: '∞', icon: '⭐' },
                    { label: 'Status', value: '⚡ DEV', icon: '💀' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: `${config.color}08`, border: `1px solid ${config.color}15` }}>
                      <span className="text-xs">{stat.icon}</span>
                      <p className="text-xs font-bold text-white mt-0.5">{stat.value}</p>
                      <p className="text-[9px] text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Funny footer */}
                <motion.div
                  className="mt-3 pt-2 border-t text-center" style={{ borderColor: `${config.color}15` }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-[9px] font-mono" style={{ color: `${config.color}70` }}>
                    🖥️ 100% oc • Dari ngoding sambil rebahan 🛌
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

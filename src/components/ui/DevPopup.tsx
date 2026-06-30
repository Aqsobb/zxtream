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
    const timer = setTimeout(() => setOpen(false), 8000);
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
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Lightning flash on open */}
            <motion.div
              className="fixed inset-0 bg-purple-400/10 pointer-events-none z-[-1]"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <div
              className="relative rounded-2xl overflow-hidden pointer-events-auto min-w-[320px]"
              style={{
                background: 'linear-gradient(135deg, #0a0a1a 0%, #0f172a 30%, #1e293b 60%, #0a0a1a 100%)',
                border: `2px solid ${config.color}60`,
                boxShadow: `${config.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Matrix rain mini */}
              <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-purple-400 text-[8px] font-mono whitespace-pre"
                    style={{ left: `${i * 12}%`, top: '-10%' }}
                    animate={{ y: ['0%', '400%'] }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
                  >
                    {Array.from({ length: 8 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
                  </motion.div>
                ))}
              </div>

              {/* Top glow line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Header */}
              <div className="relative p-4 pb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar with massive effects */}
                  <div className="relative">
                    {/* Outer rotating ring */}
                    <motion.div
                      className="absolute -inset-2 rounded-2xl"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${config.color}80, transparent, ${config.color}80, transparent)`,
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Pulsing glow */}
                    <motion.div
                      className="absolute -inset-4 rounded-2xl pointer-events-none"
                      animate={{
                        boxShadow: [
                          `0 0 20px ${config.color}40, 0 0 40px ${config.color}20`,
                          `0 0 40px ${config.color}60, 0 0 80px ${config.color}30`,
                          `0 0 20px ${config.color}40, 0 0 40px ${config.color}20`,
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2" style={{ borderColor: `${config.color}cc` }}>
                      <img
                        src={user.photoURL || '/images/default-avatar.png'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ backgroundColor: ['rgba(139,92,246,0.1)', 'rgba(168,85,247,0.3)', 'rgba(139,92,246,0.1)'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="text-xl">⚡</span>
                      </motion.div>
                    </div>
                    {/* Electric sparks */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-0.5 h-3 rounded-full"
                        style={{ background: config.color, left: `${15 + i * 20}%`, top: `${10 + i * 15}%` }}
                        animate={{ opacity: [0, 1, 0], scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.4 }}
                      />
                    ))}
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <motion.span
                        className="font-extrabold text-lg"
                        style={{ color: config.color }}
                        animate={{ textShadow: [`0 0 10px ${config.color}60`, `0 0 20px ${config.color}80`, `0 0 10px ${config.color}60`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {user.displayName}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <motion.span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          background: `linear-gradient(135deg, ${config.color}20, ${config.color}40)`,
                          color: config.color,
                          borderColor: `${config.color}50`,
                          boxShadow: `0 0 10px ${config.color}30`,
                        }}
                        animate={{ boxShadow: [`0 0 8px ${config.color}30`, `0 0 16px ${config.color}50`, `0 0 8px ${config.color}30`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⚡ DEVELOPER
                      </motion.span>
                      <span className="text-[10px] font-mono font-bold" style={{ color: config.color }}>LV. 99999</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title bar */}
              <motion.div
                className="mx-4 px-3 py-1.5 rounded-lg text-center"
                style={{
                  background: `linear-gradient(135deg, ${config.color}15, ${config.color}25)`,
                  border: `1px solid ${config.color}30`,
                }}
                animate={{
                  borderColor: [`${config.color}30`, `${config.color}60`, `${config.color}30`],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.p
                  className="text-sm font-extrabold tracking-wider"
                  style={{ color: config.color }}
                  animate={{ textShadow: [`0 0 8px ${config.color}40`, `0 0 16px ${config.color}70`, `0 0 8px ${config.color}40`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚔️ {user.title || config.title || 'Penghancur & Pencipta'} ⚔️
                </motion.p>
              </motion.div>

              {/* Stats grid */}
              <div className="p-4 pt-3 grid grid-cols-3 gap-2">
                {[
                  { label: 'EXP', value: user.totalExp?.toLocaleString() || '∞', icon: '💫' },
                  { label: 'Watch Time', value: user.watchTime ? `${Math.floor(user.watchTime / 60)}h` : '∞', icon: '⏱️' },
                  { label: 'Role', value: 'DEV', icon: '⚡' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-2 rounded-lg"
                    style={{
                      background: `${config.color}10`,
                      border: `1px solid ${config.color}20`,
                    }}
                  >
                    <span className="text-sm">{stat.icon}</span>
                    <p className="text-xs font-bold text-white mt-0.5">{stat.value}</p>
                    <p className="text-[9px] text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2 text-center text-[10px] border-t"
                style={{ borderColor: `${config.color}20`, color: `${config.color}80` }}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡ Bukan Tuhan. Tapi yang bikin semuanya. ⚡
                </motion.span>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${1 + Math.random() * 2}px`,
                      height: `${1 + Math.random() * 2}px`,
                      background: ['#a78bfa', '#818cf8', '#60a5fa', '#c084fc'][i % 4],
                      left: `${Math.random() * 100}%`,
                      bottom: '0%',
                    }}
                    animate={{
                      y: [0, -150 - Math.random() * 100],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

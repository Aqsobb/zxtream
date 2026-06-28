'use client';

import { motion } from 'framer-motion';
import { getRoleConfig, UserRole } from '@/lib/roles';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function RoleBadge({ role, size = 'md', showLabel = true, className = '' }: RoleBadgeProps) {
  const config = getRoleConfig(role);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 font-bold rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${config.color}20, ${config.color}40)`,
        color: config.color,
        border: `1px solid ${config.color}50`,
        boxShadow: config.glow !== 'none' ? config.glow : undefined,
      }}
    >
      <span>{config.badge}</span>
      {showLabel && <span>{config.label}</span>}
    </motion.span>
  );
}

interface RoleNameProps {
  name: string;
  role: string;
  className?: string;
}

export function RoleName({ name, role, className = '' }: RoleNameProps) {
  const config = getRoleConfig(role);

  return (
    <span className={`relative inline-flex items-center gap-2 ${className}`}>
      {config.crown && (
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg"
        >
          👑
        </motion.span>
      )}
      <span
        className="font-bold"
        style={{
          color: config.color,
          textShadow: config.glow !== 'none' ? `0 0 12px ${config.color}60` : undefined,
        }}
      >
        {name}
      </span>
      {config.particles && <RoleParticles color={config.color} />}
    </span>
  );
}

function RoleParticles({ color }: { color: string }) {
  return (
    <span className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: color }}
          animate={{
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * -30 - 10],
            opacity: [0.8, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </span>
  );
}

interface ProfileCardProps {
  user: {
    displayName: string;
    photoURL?: string;
    role?: string;
    level?: number;
    exp?: number;
    title?: string;
    badges?: string[];
  };
  className?: string;
}

export function ProfileCard({ user, className = '' }: ProfileCardProps) {
  const config = getRoleConfig(user.role || 'member');
  const role = user.role || 'member';
  const isPremium = role === 'owner' || role === 'vvip' || role === 'dev';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${className}`}
      style={{
        boxShadow: config.glow !== 'none' ? config.glow : undefined,
      }}
    >
      {/* Banner background for premium users */}
      {isPremium && (
        <div
          className="absolute inset-0"
          style={{
            background: role === 'owner'
              ? 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 30%, #4a1942 60%, #1a0533 100%)'
              : role === 'dev'
              ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
              : `linear-gradient(135deg, ${config.color}30, ${config.color}10, ${config.color}30)`,
          }}
        />
      )}
      {!isPremium && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${config.color}08, ${config.color}15)`,
          }}
        />
      )}

      {/* Animated border glow for owner/dev */}
      {(role === 'owner' || role === 'dev') && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: `2px solid transparent`,
            background: `linear-gradient(135deg, ${config.color}40, transparent, ${config.color}40) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Background particles for special roles */}
      {config.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-30"
              style={{ background: config.color }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          {/* Avatar with glow */}
          <div className="relative">
            <img
              src={user.photoURL || '/images/default-avatar.png'}
              alt={user.displayName}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{
                boxShadow: config.glow !== 'none' ? `0 0 20px ${config.color}40` : undefined,
                border: `2px solid ${config.color}60`,
              }}
            />
            {config.crown && (
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-1 text-2xl"
              >
                👑
              </motion.div>
            )}
            {role === 'vvip' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 text-lg"
              >
                💎
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <RoleName name={user.displayName} role={role} className="text-xl" />
            <div className="flex items-center gap-3 mt-1">
              <RoleBadge role={role} size="sm" />
              <span className="text-sm text-gray-400">
                Level {user.level || 1}
              </span>
            </div>
            {user.title && (
              <p className="text-sm text-gray-300 mt-1 italic">{user.title}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

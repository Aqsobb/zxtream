'use client';

import PremiumNick from '@/components/ui/PremiumNick';

interface DevNameProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function DevName({ name, className = '', size = 'md' }: DevNameProps) {
  return <PremiumNick name={name} className={className} size={size} variant="galaxy" />;
}

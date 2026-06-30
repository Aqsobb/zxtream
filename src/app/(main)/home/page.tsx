import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import HomeContent from '@/components/anime/HomeContent';

export const metadata: Metadata = {
  title: 'Z.XTREAM - Nonton Donghua & Drama Sub Indo',
};

export default function HomePage() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}

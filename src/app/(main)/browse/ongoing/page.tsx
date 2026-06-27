'use client';

import { Suspense } from 'react';
import { HiOutlinePlay } from 'react-icons/hi';
import BrowsePage from '@/components/anime/BrowsePage';

function Content() {
  return (
    <BrowsePage
      title="Ongoing Terupdate"
      icon={<HiOutlinePlay className="w-6 h-6 text-green-400" />}
      apiEndpoint="/api/anime/ongoing"
      accentColor="green"
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="p-4 lg:p-6 text-center py-12">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <Content />
    </Suspense>
  );
}

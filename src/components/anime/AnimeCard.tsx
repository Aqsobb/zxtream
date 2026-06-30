'use client';

import Link from 'next/link';
import { HiOutlineFire, HiOutlinePlay } from 'react-icons/hi';

interface AnimeCardProps {
  anime: {
    title: string;
    slug: string;
    thumbnail: string;
    episode?: string;
    episodeNum?: string;
    type?: string;
    rating?: string;
    url?: string;
    isHot?: boolean;
  };
  index?: number;
  href?: string;
}

export default function AnimeCard({ anime, index, href }: AnimeCardProps) {
  const typeColors: Record<string, string> = {
    Donghua: 'bg-blue-500/90',
    Movie: 'bg-purple-500/90',
    ONA: 'bg-orange-500/90',
    TV: 'bg-green-500/90',
    OVA: 'bg-pink-500/90',
  };

  const badgeColor = typeColors[anime.type || ''] || 'bg-dark-600/90';
  const isDrama = anime.type === 'drama';
  const resolvedHref = href || (isDrama ? `/drama/${anime.slug.replace(/^drama-/, '')}` : `/anime/${anime.slug}`);

  return (
    <Link href={resolvedHref} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-dark-800 border border-white/5 transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Hot badge */}
          {anime.isHot && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-md text-white text-[10px] font-bold shadow-lg">
              <HiOutlineFire className="w-3 h-3" />
              HOT
            </div>
          )}

          {/* Type badge */}
          {anime.type && (
            <div className={`absolute top-2 right-2 px-2 py-0.5 ${badgeColor} text-white text-[10px] font-bold rounded-md shadow-lg`}>
              {anime.type}
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <HiOutlinePlay className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
            {/* Episode badge */}
            {anime.episode && (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                  {anime.episode}
                </span>
                <span className="px-1.5 py-0.5 bg-primary-600/80 text-white text-[10px] font-bold rounded">
                  Sub
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="p-2">
          <h3 className="font-medium text-xs line-clamp-2 group-hover:text-purple-400 transition-colors text-white leading-tight">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

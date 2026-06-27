'use client';

import Link from 'next/link';

interface AnimeCardProps {
  anime: {
    title: string;
    slug: string;
    thumbnail: string;
    episode?: string;
    episodeNum?: string;
    type?: string;
    rating?: string;
    url: string;
  };
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Episode badge */}
          {anime.episode && (
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg shadow-lg">
              {anime.episode}
            </div>
          )}

          {/* Type badge */}
          {anime.type && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/10">
              {anime.type}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-purple-400 transition-colors text-white">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

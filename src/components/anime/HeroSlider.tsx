'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { HiOutlinePlay, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroSlide {
  title: string;
  slug: string;
  thumbnail: string;
  synopsis?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  if (slides.length === 0) {
    return (
      <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-white/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Z.XTREAM
              </span>
            </h2>
            <p className="text-gray-400 mb-6">Nonton donghua sub Indo gratis</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <HiOutlinePlay className="w-5 h-5" />
              Mulai Nonton
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          prevEl: '.hero-prev',
          nextEl: '.hero-next',
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={slides.length > 1}
        keyboard={{ enabled: true }}
        className="rounded-2xl overflow-hidden h-[280px] sm:h-[360px] lg:h-[420px]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={`${slide.slug}-${i}`}>
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute inset-0 flex items-end sm:items-center p-6 sm:p-10">
                <div className="max-w-lg">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                  {slide.synopsis && (
                    <p className="text-gray-300 text-sm line-clamp-3 mb-5 drop-shadow-md hidden sm:block">
                      {slide.synopsis}
                    </p>
                  )}
                  <Link
                    href={`/anime/${slide.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                  >
                    <HiOutlinePlay className="w-5 h-5" />
                    Tonton
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <>
          <button className="hero-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 border border-white/10 sm:opacity-0">
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
          <button className="hero-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 border border-white/10 sm:opacity-0">
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

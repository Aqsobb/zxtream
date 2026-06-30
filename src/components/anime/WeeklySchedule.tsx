'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineCalendar } from 'react-icons/hi';

interface ScheduleItem {
  title: string;
  slug: string;
}

interface ScheduleDay {
  name: string;
  items: ScheduleItem[];
}

interface WeeklyScheduleProps {
  schedule: ScheduleDay[];
}

const DAYS_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', "Jum'at", 'Sabtu', 'Minggu', 'Acak'];

function normalizeDay(name: string): string {
  if (name === "Jum'at") return 'Jumat';
  return name;
}

export default function WeeklySchedule({ schedule }: WeeklyScheduleProps) {
  const [activeDay, setActiveDay] = useState(() => {
    const dayIdx = new Date().getDay();
    const map = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return map[dayIdx] || 'Senin';
  });

  if (!schedule || schedule.length === 0) return null;

  const normalizedSchedule = schedule.map(s => ({
    ...s,
    name: normalizeDay(s.name),
  }));

  const uniqueDays = DAYS_ORDER.filter(d => {
    const nd = normalizeDay(d);
    return normalizedSchedule.some(s => s.name === nd);
  }).filter((d, i, arr) => {
    const nd = normalizeDay(d);
    return arr.findIndex(x => normalizeDay(x) === nd) === i;
  });

  const sortedSchedule = uniqueDays
    .map(d => normalizedSchedule.find(s => s.name === normalizeDay(d))!)
    .filter(Boolean);

  const activeItems = sortedSchedule.find(s => s.name === activeDay)?.items || [];

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <HiOutlineCalendar className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold">Jadwal Rilis</h2>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {sortedSchedule.map(day => (
          <button
            key={day.name}
            onClick={() => setActiveDay(day.name)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeDay === day.name
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {day.name}
            <span className="ml-1.5 text-xs opacity-60">({day.items.length})</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
      >
        {activeItems.length > 0 ? (
          activeItems.map((item, i) => (
            <Link
              key={`${item.slug}-${i}`}
              href={`/anime/${item.slug}`}
              className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-all group border border-white/5 hover:border-purple-500/20"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform" />
              <span className="text-sm text-gray-300 truncate group-hover:text-purple-400 transition-colors">
                {item.title}
              </span>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-6 text-dark-400 text-sm">
            Tidak ada jadwal hari ini
          </div>
        )}
      </motion.div>
    </section>
  );
}

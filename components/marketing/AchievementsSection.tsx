'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Award, Sparkles, CheckCircle2, Video } from 'lucide-react';
import { RevealOnScroll } from '@/components/ui/animations';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  category: string;
  duration: string;
  views: string;
  thumbnail: string;
}

// IMHS YouTube Channel (@imhs-instituteofmedicinean6349) Videos
const ACHIEVEMENTS_VIDEOS: VideoItem[] = [
  {
    id: '1',
    youtubeId: 'TM1nTXW2Ogs',
    title: 'IMHS General Convocation & Batch 09 Ceremony Highlights',
    category: 'Convocation',
    duration: '12m 08s',
    views: '1.9K+ views',
    thumbnail: 'https://img.youtube.com/vi/TM1nTXW2Ogs/hqdefault.jpg',
  },
  {
    id: '2',
    youtubeId: 'rGxAPjR18zY',
    title: 'IMHS Modern Pharmacy Course — Day 01 Introduction Session',
    category: 'Lecture Series',
    duration: '1h 56m',
    views: '1.5K+ views',
    thumbnail: 'https://img.youtube.com/vi/rGxAPjR18zY/hqdefault.jpg',
  },
  {
    id: '3',
    youtubeId: '05ne6S6vHJE',
    title: 'Fast Track Working Plan — External Pharmacist Examination by Dr. Isuru Wijesinghe',
    category: 'Exam Guide',
    duration: '6m 12s',
    views: '3.5K+ views',
    thumbnail: 'https://img.youtube.com/vi/05ne6S6vHJE/hqdefault.jpg',
  },
  {
    id: '4',
    youtubeId: 'qoIr3ZneT6Y',
    title: 'Modern Pharmacy Education — Hypoglycemic Medications Lecture',
    category: 'Pharmacology',
    duration: '1h 58m',
    views: '800+ views',
    thumbnail: 'https://img.youtube.com/vi/qoIr3ZneT6Y/hqdefault.jpg',
  },
  {
    id: '5',
    youtubeId: 'zNTB_vH8E2E',
    title: 'English for Healthcare Professionals & Pharmacy Practice',
    category: 'Special Module',
    duration: '2m 41s',
    views: '1.2K+ views',
    thumbnail: 'https://img.youtube.com/vi/zNTB_vH8E2E/hqdefault.jpg',
  },
];

export function AchievementsSection() {
  const [activeVideo, setActiveVideo] = useState<VideoItem>(ACHIEVEMENTS_VIDEOS[0]);

  return (
    <section id="achievements" className="relative py-20 bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <RevealOnScroll className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold mb-3">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>EXCELLENCE IN MEDICAL EDUCATION</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-white">
            Our Achievements & <span className="text-[#F16726]">Highlights</span>
          </h2>
          <div className="w-16 h-1 bg-[#F16726] mx-auto rounded-full mt-3" />
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">
            Explore convocation ceremonies, lecture previews, and student success stories from the Institute of Medicine and Health Sciences.
          </p>
        </RevealOnScroll>

        {/* Video Player Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Cinema Player (Left 7/12) */}
          <RevealOnScroll className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl shadow-blue-950/50 group">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </RevealOnScroll>

          {/* Watch Next Playlist Sidebar (Right 5/12) */}
          <RevealOnScroll className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F16726]" />
                <span>Watch Next</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">{ACHIEVEMENTS_VIDEOS.length} Videos</span>
            </div>

            {/* Scrollable Video List without Visible Scrollbar */}
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {ACHIEVEMENTS_VIDEOS.map((video) => {
                const isActive = activeVideo.id === video.id;

                return (
                  <motion.button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl transition text-left group ${
                      isActive
                        ? 'bg-blue-900/40 border border-blue-500/40 shadow-md'
                        : 'hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    {/* Thumbnail Container */}
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                        {video.duration}
                      </div>

                      {/* Play Icon Overlay */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 transition ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#F16726] font-semibold mb-0.5">
                        {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>{video.category}</span>
                      </div>
                      <h5
                        className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {video.title}
                      </h5>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
}

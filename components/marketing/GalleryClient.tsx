"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { VitalLine } from "@/components/ui/vital-line";
import {
  DNAHelix,
  AtomicOrbit,
  BenzeneRing,
  MedicalCross,
  PillCapsuleOrbs,
  RxCredentialBadge,
  MedicalScannerBeam,
} from "@/components/marketing/PharmacyAnimations";
import { cn } from "@/lib/utils";
import {
  X,
  Maximize2,
  Calendar,
  Video,
  Play,
  Image as ImageIcon,
} from "lucide-react";

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  title: string;
  category?: string;
  src: string;
  thumbnailUrl?: string | null;
  description: string;
  tag?: string | null;
  date: string;
}

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  const filteredItems = items.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "PHOTO") return item.type === "image";
    if (filter === "VIDEO") return item.type === "video";
    return item.category === filter;
  });

  return (
    <div className="overflow-x-hidden bg-surface">
      {/* ── HERO SECTION ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />
        {/* Pharmacy animations in hero background */}
        <DNAHelix width={70} height={320} className="absolute right-8 top-12 opacity-35 hidden lg:block" />
        <AtomicOrbit size={180} color="#F16726" className="absolute -top-12 -left-12 opacity-20" />
        <BenzeneRing size={120} color="#4A8B7A" className="absolute -bottom-6 right-1/4 opacity-20 hidden md:block" />
        <MedicalCross size={22} color="#F16726" className="absolute top-20 left-1/4 opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <RxCredentialBadge label="OFFICIAL IMHS VIDEO GALLERY" />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink leading-tight">
            IMHS Events &amp;{" "}
            <span className="text-clinical-teal">Learning Video Gallery</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Explore official video highlights from IMHS academic programmes, practical training sessions, workshops, convocations, and special events.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <VitalLine variant="hero" animated={true} />
          </div>
        </div>
      </section>

      {/* ── GALLERY MEDIA GRID SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 relative">
        <PillCapsuleOrbs count={6} className="opacity-40" />

        {/* Category & Type Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
              filter === "ALL"
                ? "bg-clinical-teal text-white shadow-paper"
                : "bg-surface border border-chart-grid text-ink hover:border-clinical-teal"
            )}
          >
            All Media ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("PHOTO")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
              filter === "PHOTO"
                ? "bg-clinical-teal text-white shadow-paper"
                : "bg-surface border border-chart-grid text-ink hover:border-clinical-teal"
            )}
          >
            📷 Photos ({items.filter((i) => i.type === "image").length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("VIDEO")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
              filter === "VIDEO"
                ? "bg-clinical-teal text-white shadow-paper"
                : "bg-surface border border-chart-grid text-ink hover:border-clinical-teal"
            )}
          >
            🎬 Videos ({items.filter((i) => i.type === "video").length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
                filter === cat
                  ? "bg-clinical-teal text-white shadow-paper"
                  : "bg-surface border border-chart-grid text-ink hover:border-clinical-teal"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper hover:border-clinical-teal hover:shadow-paper-stack transition-all duration-300 flex flex-col justify-between"
              >
                {/* Media Container */}
                <div
                  onClick={() => setActiveItem(item)}
                  className="relative w-full h-[360px] sm:h-[420px] bg-ink cursor-pointer overflow-hidden group"
                >
                  <MedicalScannerBeam />
                  {item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <>
                      <video
                        src={item.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-chart-red/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </>
                  )}

                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-white bg-chart-red/90 px-2.5 py-1 rounded-full shadow-sm z-10">
                    {item.type === "video" ? (
                      <>
                        <Video className="w-3 h-3" /> Official IMHS Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3" /> PHOTO
                      </>
                    )}
                  </span>

                  {item.tag && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm z-10">
                      {item.tag}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sage flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                    <button
                      onClick={() => setActiveItem(item)}
                      className="text-xs font-mono font-bold text-clinical-teal hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> {item.type === "video" ? "Watch Full Video" : "Enlarge Photo"}
                    </button>
                  </div>

                  <h3 className="text-base font-semibold font-sans text-ink group-hover:text-clinical-teal transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── LIGHTBOX MODAL (ENLARGED PHOTO / VIDEO PLAYER) ── */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-chart-grid rounded-card max-w-4xl w-full overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 p-2 text-white bg-ink/70 rounded-full hover:bg-chart-red transition-colors z-30 shadow-md cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-[65vh] bg-ink flex items-center justify-center overflow-hidden">
                {activeItem.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeItem.src}
                    alt={activeItem.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <>
                    <video
                      src={activeItem.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                    />
                    <video
                      src={activeItem.src}
                      controls
                      autoPlay
                      className="relative z-10 max-w-full max-h-[65vh] h-full object-contain shadow-2xl"
                    />
                  </>
                )}
              </div>

              <div className="p-6 space-y-3 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sage flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> IMHS Archive · {activeItem.date}
                  </span>
                  <span className="text-xs font-mono text-chart-red font-bold flex items-center gap-1">
                    {activeItem.type === "video" ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    {activeItem.type === "video" ? "Official IMHS Video" : "Campus Photo"}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-ink">
                  {activeItem.title}
                </h3>

                {activeItem.description && (
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {activeItem.description}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveItem(null)}
                    className="rounded-full text-xs font-mono"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


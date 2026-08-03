"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, GlowOrb, RevealOnScroll } from "@/components/ui/animations";
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
import {
  Image as ImageIcon,
  X,
  Maximize2,
  Calendar,
  Play,
  Video,
} from "lucide-react";

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  title: string;
  src: string;
  poster?: string;
  description: string;
  date: string;
}

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

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
          <RxCredentialBadge label="INSTITUTIONAL GALLERY & VIDEOS" />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink leading-tight">
            IMHS Campus &amp;{" "}
            <span className="text-clinical-teal">Event Media Gallery</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Explore video highlights and photo archives from annual convocations, laboratory practicals, clinical seminars, and campus workshops in Sri Lanka.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <VitalLine variant="hero" animated={true} />
          </div>
        </div>
      </section>

      {/* ── GALLERY GRID SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 relative">
        <PillCapsuleOrbs count={6} className="opacity-40" />

        {/* Media Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {items.map((item) => {
              const isVideo = item.type === "video";
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveItem(item)}
                  className="group bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper hover:border-clinical-teal hover:shadow-paper-stack transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-64 w-full overflow-hidden bg-ink">
                    <MedicalScannerBeam />

                    {isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.src}
                          poster={item.poster}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Video Play Overlay Icon */}
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/30 group-hover:bg-ink/50 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-chart-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-white bg-chart-red/90 px-2.5 py-1 rounded-full shadow-sm">
                          <Video className="w-3 h-3" /> VIDEO
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-clinical-teal/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                        {isVideo ? <Play className="w-3.5 h-3.5 fill-white" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        {isVideo ? "Play Video" : "View Photo"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sage flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                      {isVideo && (
                        <span className="text-[10px] font-mono text-chart-red font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" /> Event Video
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold font-sans text-ink group-hover:text-clinical-teal transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── LIGHTBOX MODAL (PHOTO & VIDEO PLAYER) ── */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-chart-grid rounded-card max-w-3xl w-full overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 p-2 text-white bg-ink/60 rounded-full hover:bg-chart-red transition-colors z-30 shadow-md"
                aria-label="Close media"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-80 sm:h-[420px] w-full bg-ink flex items-center justify-center">
                {activeItem.type === "video" ? (
                  <video
                    src={activeItem.src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <Image
                    src={activeItem.src}
                    alt={activeItem.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="p-6 space-y-3 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sage flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> IMHS Archive · {activeItem.date}
                  </span>
                  {activeItem.type === "video" && (
                    <span className="text-xs font-mono text-chart-red font-bold flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" /> Official Event Recording
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-ink">
                  {activeItem.title}
                </h3>

                <p className="text-sm text-ink-muted leading-relaxed">
                  {activeItem.description}
                </p>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveItem(null)}
                    className="rounded-full text-xs font-mono"
                  >
                    Close Preview
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


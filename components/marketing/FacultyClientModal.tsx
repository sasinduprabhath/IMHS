"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Award, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
}

export function FacultyClientModal({ faculty }: { faculty: FacultyMember[] }) {
  const [selectedMember, setSelectedMember] = useState<FacultyMember | null>(null);

  const getProfileLink = (member: FacultyMember) => {
    if (member.name.toLowerCase().includes("isuru")) {
      return "/dr-isuru-wijesinghe";
    }
    return `/faculty/${member.id}`;
  };

  return (
    <div>
      <div className={`grid grid-cols-1 ${faculty.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-3"} gap-8`}>
        {faculty.map((member) => {
          const profileHref = getProfileLink(member);
          const photoSrc = member.photoUrl || "/faculty/avatar-placeholder.svg";

          return (
            <div
              key={member.id}
              className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 text-center hover:border-clinical-teal hover:shadow-paper-stack transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <Link href={profileHref} className="block">
                  <div className="w-28 h-28 mx-auto relative rounded-full overflow-hidden border-2 border-chart-grid group-hover:border-clinical-teal transition-colors shadow-md bg-linen/50">
                    <Image
                      src={photoSrc}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div>
                  <Link href={profileHref} className="block">
                    <h3 className="text-lg font-semibold font-sans text-ink group-hover:text-clinical-teal transition-colors">
                      {member.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-mono text-clinical-teal mt-1">
                    {member.title}
                  </p>
                </div>

                <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed font-sans">
                  {member.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-chart-grid/60 flex items-center justify-center gap-3">
                <Link href={profileHref}>
                  <Button size="sm" variant="default" className="gap-1.5 text-xs font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0">
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMember(member)}
                  className="text-xs"
                >
                  Quick Bio
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup for Quick View */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-chart-grid rounded-card max-w-lg w-full relative shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 text-ink-muted hover:text-chart-red transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chart-record header */}
            <div className="px-6 py-5 border-b border-chart-grid bg-linen/40">
              <p className="text-[9px] font-mono uppercase tracking-widest text-sage font-bold mb-3">
                Consultant Profile Chart
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-clinical-teal shrink-0 bg-linen/50">
                  <Image
                    src={selectedMember.photoUrl || "/faculty/avatar-placeholder.svg"}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                    unoptimized={selectedMember.photoUrl?.startsWith("http")}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold font-display text-ink leading-tight">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs font-mono text-clinical-teal mt-0.5">
                    {selectedMember.title}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-mono font-bold border border-sage/30 text-sage bg-sage/5 px-2.5 py-0.5 rounded-full">
                    <Stethoscope className="w-3 h-3" /> Senior Faculty · IMHS
                  </span>
                </div>
              </div>
            </div>

            {/* Bio section */}
            <div className="px-6 py-5 border-b border-chart-grid/60 space-y-2">
              <h4 className="font-mono text-[10px] text-sage uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-chart-red" /> Clinical Background &amp; Biography
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans whitespace-pre-line">
                {selectedMember.bio}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex justify-between items-center">
              <Link href={getProfileLink(selectedMember)}>
                <Button size="sm" className="gap-1.5 text-xs font-semibold bg-clinical-teal text-white border-0 rounded-full">
                  Full Page Profile &rarr;
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setSelectedMember(null)} className="rounded-full text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

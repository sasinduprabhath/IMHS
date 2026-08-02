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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {faculty.map((member) => {
          const profileHref = getProfileLink(member);
          const photoSrc = member.name.toLowerCase().includes("isuru") ? "/isuru.png" : (member.photoUrl || "/isuru.png");

          return (
            <div
              key={member.id}
              className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 text-center hover:border-clinical-teal hover:shadow-paper-stack transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <Link href={profileHref} className="block">
                  <div className="w-28 h-28 mx-auto relative rounded-full overflow-hidden border-2 border-chart-grid group-hover:border-clinical-teal transition-colors shadow-md">
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
          <div className="bg-surface border border-chart-grid rounded-card max-w-lg w-full p-6 md:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 text-ink-muted hover:text-chart-red transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative rounded-full overflow-hidden border-2 border-clinical-teal shrink-0">
                <Image
                  src={selectedMember.name.toLowerCase().includes("isuru") ? "/isuru.png" : (selectedMember.photoUrl || "/isuru.png")}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-sans text-ink">
                  {selectedMember.name}
                </h3>
                <p className="text-xs font-mono text-clinical-teal mt-0.5">
                  {selectedMember.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-clinical-teal-surface text-clinical-teal px-2 py-0.5 rounded">
                    <Stethoscope className="w-3 h-3" /> Senior Faculty
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-chart-grid pt-4">
              <h4 className="font-mono text-xs text-sage uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-chart-red" /> Clinical Background & Biography
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans whitespace-pre-line">
                {selectedMember.bio}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-chart-grid/60">
              <Link href={getProfileLink(selectedMember)}>
                <Button size="sm" className="gap-1.5 text-xs font-semibold bg-clinical-teal text-white border-0">
                  Full Page Profile &rarr;
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setSelectedMember(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

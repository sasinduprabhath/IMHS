import React from "react";
import { GalleryClient } from "@/components/marketing/GalleryClient";

export const metadata = {
  title: "IMHS Gallery - Institutional Events, Convocations & Practicals",
  description:
    "Explore photo highlights from IMHS annual convocations, graduation ceremonies, laboratory practicals, and clinical seminars in Sri Lanka.",
};

const GALLERY_ITEMS = [
  {
    id: "v1",
    type: "video" as const,
    title: "IMHS Practical & Clinical Training Session",
    src: "/gallery/gallery-video-1.mp4",
    description: "Live practical video demonstration of pharmaceutical dispensing and clinical lab techniques.",
    date: "2024",
  },
  {
    id: "v2",
    type: "video" as const,
    title: "Student Convocation & Award Ceremony Highlights",
    src: "/gallery/gallery-video-2.mp4",
    description: "Video highlights from the IMHS General Convocation & Distinction Awards distribution.",
    date: "2024",
  },
  {
    id: "v3",
    type: "video" as const,
    title: "Campus Lecture & Interactive Workshop",
    src: "/gallery/gallery-video-3.mp4",
    description: "Senior consultant lecture on pharmacology seq preparation and clinical pathology.",
    date: "2024",
  },
];

export default function GalleryPage() {
  return <GalleryClient items={GALLERY_ITEMS} />;
}

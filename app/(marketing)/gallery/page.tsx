import React from "react";
import { GalleryClient } from "@/components/marketing/GalleryClient";

export const metadata = {
  title: "Campus Gallery | Convocations, Practicals & Life at IMHS",
  description:
    "Explore photo and video highlights from IMHS annual convocations, graduation ceremonies, laboratory practicals, and clinical seminars in Sri Lanka.",
  alternates: {
    canonical: "https://imhsedu.com/gallery",
  },
  openGraph: {
    title: "IMHS Campus & Convocation Gallery",
    description: "Explore laboratory practicals, graduation ceremonies, and clinical seminars at IMHS.",
    url: "https://imhsedu.com/gallery",
    images: [{ url: "/gallery/convocation-2024.webp", width: 1200, height: 630, alt: "IMHS Convocation & Campus Gallery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Gallery | IMHS Education",
    description: "Annual convocations, practical dispensaries, and clinical labs.",
    images: ["/gallery/convocation-2024.webp"],
  },
};

import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function GalleryPage() {
  let items: any[] = [];
  try {
    const dbItems = await prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    if (dbItems.length > 0) {
      items = dbItems.map((item) => ({
        id: item.id,
        type: item.type === "PHOTO" ? "image" : "video",
        title: item.title,
        category: item.category,
        src: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        description: item.description || "",
        tag: item.tag,
        date: item.date || "2024",
      }));
    }
  } catch (error) {
    console.error("Gallery page DB connection error:", error);
  }

  if (items.length === 0) {
    items = [
      {
        id: "v1",
        type: "video",
        title: "Practical and Clinical Training Sessions",
        category: "Practicals",
        src: "/gallery/gallery-video-1.mp4",
        thumbnailUrl: "/gallery/pharmaceutical-lab.jpg",
        description: "Watch practical demonstrations of pharmaceutical dispensing and essential clinical techniques.",
        tag: "CLINICAL LABS",
        date: "2024",
      },
      {
        id: "v2",
        type: "video",
        title: "Student Convocation and Award Ceremony",
        category: "Convocation",
        src: "/gallery/gallery-video-2.mp4",
        thumbnailUrl: "/gallery/graduation-ceremony.webp",
        description: "Highlights from the IMHS General Convocation and student award presentations.",
        tag: "CONVOCATION",
        date: "2024",
      },
      {
        id: "v3",
        type: "video",
        title: "Academic Lectures and Interactive Workshops",
        category: "Workshops",
        src: "/gallery/gallery-video-3.mp4",
        thumbnailUrl: "/gallery/pharmacy-practical.jpg",
        description: "Highlights from academic lectures, examination preparation sessions, interactive workshops, and student activities.",
        tag: "WORKSHOPS",
        date: "2024",
      },
    ];
  }

  return <GalleryClient items={items} />;
}

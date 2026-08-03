import React from "react";
import { GalleryClient } from "@/components/marketing/GalleryClient";

export const metadata = {
  title: "IMHS Gallery - Institutional Events, Convocations & Practicals",
  description:
    "Explore photo highlights from IMHS annual convocations, graduation ceremonies, laboratory practicals, and clinical seminars in Sri Lanka.",
};

const GALLERY_ITEMS = [
  {
    id: "g1",
    title: "IMHS Annual General Convocation 2024",
    src: "/gallery/convocation-2024.webp",
    description: "Celebrating over 3,500 healthcare & pharmacy graduates at the annual IMHS Convocation.",
    date: "2024",
  },
  {
    id: "g2",
    title: "Graduating Batch Awards & Certification",
    src: "/gallery/graduation-ceremony.webp",
    description: "Awarding certificates to distinction students across pharmaceutical & clinical programs.",
    date: "2024",
  },
  {
    id: "g3",
    title: "Clinical Lecture & Medical Seminar",
    src: "/gallery/clinical-lecture.jpg",
    description: "Consultant-led seminar on advanced clinical therapeutics and hospital ward procedures.",
    date: "2024",
  },
  {
    id: "g4",
    title: "Pharmaceutical Manufacturing Laboratory",
    src: "/gallery/pharmaceutical-lab.jpg",
    description: "Hands-on cleanroom formulation, tablet coating, and industrial QA practicals.",
    date: "2024",
  },
  {
    id: "g5",
    title: "SLMC Pharmacy Exam Practical Preparation",
    src: "/gallery/pharmacy-practical.jpg",
    description: "Interactive dispensing, prescription analysis, and pathology slide interpretation.",
    date: "2024",
  },
  {
    id: "g6",
    title: "Medical Board & Senior Faculty Consultation",
    src: "/gallery/faculty-consultation.jpg",
    description: "Academic directors and consultant doctors shaping peer-reviewed healthcare curricula.",
    date: "2024",
  },
  {
    id: "g7",
    title: "Clinical Pharmacy Dispensing Training",
    src: "/gallery/pharmacy-dispensing.jpg",
    description: "Modern pharmacy dispensing protocols, drug safety, and patient counseling simulations.",
    date: "2024",
  },
  {
    id: "g8",
    title: "IMHS Institutional Campus Maharagama",
    src: "/gallery/imhs-campus.jpg",
    description: "State-of-the-art lecturing halls and pharmaceutical science learning environment.",
    date: "2024",
  },
];

export default function GalleryPage() {
  return <GalleryClient items={GALLERY_ITEMS} />;
}

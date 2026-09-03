import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact IMHS | Admissions & Inquiries",
  description:
    "Have questions about our courses, admissions, fees, or SLMC External Pharmacist Examination preparation? Complete the inquiry form or contact our Admissions Team via WhatsApp.",
  alternates: {
    canonical: "https://imhsedu.com/contact",
  },
  openGraph: {
    title: "Contact IMHS | Admissions & Inquiries",
    description: "Get in touch with the IMHS admissions team for course details, registrations, and SLMC External Pharmacist Examination preparation in Sri Lanka.",
    url: "https://imhsedu.com/contact",
    images: [{ url: "/gallery/imhs-campus.jpg", width: 1200, height: 630, alt: "Contact IMHS Campus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact IMHS | Admissions & Inquiries",
    description: "Get in touch with IMHS admissions and student support in Sri Lanka.",
    images: ["/gallery/imhs-campus.jpg"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

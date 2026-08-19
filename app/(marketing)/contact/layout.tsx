import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Admissions & Campus Inquiries",
  description:
    "Get in touch with the IMHS admissions team, book an on-campus consultation in Maharagama, or send an inquiry for our pharmacy programs.",
  alternates: {
    canonical: "https://imhsedu.com/contact",
  },
  openGraph: {
    title: "Contact IMHS | Admissions & Student Support",
    description: "Reach our admissions team and student support at IMHS Colombo Campus.",
    url: "https://imhsedu.com/contact",
    images: [{ url: "/gallery/imhs-campus.jpg", width: 1200, height: 630, alt: "Contact IMHS Campus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | IMHS Education",
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

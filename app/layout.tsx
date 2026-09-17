import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imhsedu.com"),
  title: {
    default: "IMHS | Institute of Medicine and Health Sciences",
    template: "%s | IMHS",
  },
  description:
    "Sri Lanka's premier healthcare and pharmacy education institution. Offering SLMC-aligned pharmacy courses, clinical pharmacology, dispensary management, and post-graduate healthcare certifications.",
  keywords: [
    "IMHS",
    "Institute of Medicine and Health Sciences",
    "Pharmacy Courses Sri Lanka",
    "SLMC Pharmacist Exam Preparation",
    "Modern Pharmacy Practice",
    "Clinical Pharmacology",
    "Certificate in Pharmacy Practice",
    "Dr. Isuru Wijesinghe",
    "Healthcare Education Sri Lanka",
    "OSPE Pharmacist Revision",
    "Pharmacy Dispensary Management",
  ],
  authors: [{ name: "Institute of Medicine and Health Sciences", url: "https://imhsedu.com" }],
  creator: "IMHS Education",
  publisher: "Institute of Medicine and Health Sciences",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://imhsedu.com",
  },
  openGraph: {
    title: "IMHS | Institute of Medicine and Health Sciences",
    description:
      "Empowering future pharmacists and healthcare professionals in Sri Lanka with industry-leading clinical courses and SLMC exam preparation.",
    url: "https://imhsedu.com",
    siteName: "IMHS - Institute of Medicine and Health Sciences",
    images: [
      {
        url: "/gallery/imhs-campus.jpg",
        width: 1200,
        height: 630,
        alt: "IMHS Campus & Modern Pharmacy Education",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMHS | Institute of Medicine and Health Sciences",
    description:
      "Premier healthcare education portal for pharmacy practice, clinical simulations, and SLMC qualifications in Sri Lanka.",
    images: ["/gallery/imhs-campus.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Institute of Medicine and Health Sciences",
  alternateName: "IMHS",
  url: "https://imhsedu.com",
  logo: "https://imhsedu.com/favicon.png",
  description:
    "Leading medical and pharmacy education institute in Sri Lanka providing certified pharmacy practice, clinical modules, and professional medical education.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "LK",
    addressLocality: "Colombo",
    addressRegion: "Western Province",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+94-76-650-6621",
    contactType: "Customer Support and Admissions",
    areaServed: "LK",
    availableLanguage: ["English", "Sinhala"],
  },
  sameAs: [
    "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    "https://imhsedu.com",
  ],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IMHS Education",
  url: "https://imhsedu.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://imhsedu.com/courses?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        {/* Production Chunk & Stylesheet Self-Healing Auto-Recovery */}
        <Script src="/chunk-recovery.js" strategy="beforeInteractive" />
      </head>
      <body className="font-sans bg-surface text-ink min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <SmoothScrollProvider>
            <PageTransitionProvider>{children}</PageTransitionProvider>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

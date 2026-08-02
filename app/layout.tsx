import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";


const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMHS - Institute of Medicine and Health Sciences",
  description: "Standard-setting clinical pathology, electrocardiography, and post-graduate medical education portal.",
  keywords: ["Medical Education", "IMHS", "Clinical Pathology", "ECG Masterclass", "Sri Lanka Medical Education"],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
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
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans bg-linen text-ink min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <SmoothScrollProvider>
            <PageTransitionProvider>{children}</PageTransitionProvider>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

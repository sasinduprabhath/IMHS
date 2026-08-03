import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
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

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
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

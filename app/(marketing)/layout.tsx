import React from "react";
import { Footer } from "@/components/marketing/Footer";
import { PublicFloatingControls } from "@/components/marketing/PublicFloatingControls";
import { AbsorptionLine } from "@/components/motion/AbsorptionLine";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AbsorptionLine />
      <main className="flex-1">{children}</main>
      <Footer />
      <PublicFloatingControls />
    </div>
  );
}

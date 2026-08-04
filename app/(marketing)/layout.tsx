import React from "react";
import { Footer } from "@/components/marketing/Footer";
import { PublicFloatingControls } from "@/components/marketing/PublicFloatingControls";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
      <PublicFloatingControls />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { VitalLine } from "@/components/ui/vital-line";
import {
  DNAHelix,
  AtomicOrbit,
  BenzeneRing,
  RxCredentialBadge,
} from "@/components/marketing/PharmacyAnimations";
import {
  ShieldCheck,
  Lock,
  FileText,
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Institute of Medicine and Health Sciences (IMHS)",
  description:
    "Official LMS and Web Portal Privacy Policy for IMHS Sri Lanka. Learn how we collect, protect, and manage student data, field-level encryption, and payment security.",
  alternates: {
    canonical: "https://imhsedu.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | IMHS Education",
    description: "Learn how we protect student privacy and secure data at rest.",
    url: "https://imhsedu.com/privacy-policy",
    images: [{ url: "/gallery/imhs-campus.jpg", width: 1200, height: 630, alt: "IMHS Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | IMHS Education",
    description: "Student data protection and privacy policy.",
    images: ["/gallery/imhs-campus.jpg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="overflow-x-hidden bg-surface">
      {/* ── HERO SECTION ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />
        <DNAHelix width={70} height={320} className="absolute right-8 top-12 opacity-35 hidden lg:block" />
        <AtomicOrbit size={180} color="#F16726" className="absolute -top-12 -left-12 opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <RxCredentialBadge label="LEGAL & DATA PROTECTION" />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink leading-tight">
            IMHS LMS{" "}
            <span className="text-clinical-teal">Privacy Policy</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Dedicated to safeguarding the personal data, academic records, and financial security of our students, faculty, and visitors.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono text-sage">
            <span className="inline-flex items-center gap-1.5 bg-white border border-chart-grid px-3 py-1 rounded-full shadow-xs text-ink font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
              Effective Date: August 12, 2024
            </span>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <VitalLine variant="hero" animated={true} />
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT & TABLE OF CONTENTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Quick Jump Table of Contents Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 space-y-4 bg-linen/50 border border-chart-grid p-6 rounded-card shadow-paper">
            <div className="flex items-center gap-2 border-b border-chart-grid pb-3">
              <Lock className="w-4 h-4 text-clinical-teal" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                Policy Sections
              </h3>
            </div>
            <nav className="space-y-1.5 text-xs font-sans">
              {[
                { href: "#sec-1", label: "1. Introduction" },
                { href: "#sec-2", label: "2. Information We Collect" },
                { href: "#sec-3", label: "3. How We Use Your Information" },
                { href: "#sec-4", label: "4. How We Share Your Information" },
                { href: "#sec-5", label: "5. Data Security Measures" },
                { href: "#sec-6", label: "6. Payment Security & PCI" },
                { href: "#sec-7", label: "7. Cookies & Tracking" },
                { href: "#sec-8", label: "8. Your Rights & Choices" },
                { href: "#sec-9", label: "9. Children's Privacy" },
                { href: "#sec-10", label: "10. International Data Transfers" },
                { href: "#sec-11", label: "11. Changes to This Policy" },
                { href: "#sec-12", label: "12. Contact Administration" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-1.5 px-2.5 rounded text-ink-muted hover:text-clinical-teal hover:bg-white transition-all duration-150 flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </nav>
          </aside>

          {/* Legal Text Document */}
          <article className="lg:col-span-8 bg-surface border border-chart-grid p-8 sm:p-12 rounded-card shadow-paper space-y-10 font-sans text-sm leading-relaxed text-ink-muted">
            {/* Section 1 */}
            <section id="sec-1" className="space-y-3 pt-2">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">1.</span> Introduction
              </h2>
              <p>
                At the Institute of Medicine and Health Sciences (IMHS), we are dedicated to safeguarding the privacy and personal data of our students, faculty, staff, and visitors. This Privacy Policy outlines our commitment to protecting the information you provide to us through our Learning Management System (LMS) and official website.
              </p>
              <p>
                By using our LMS and website, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="sec-2" className="space-y-4">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">2.</span> Information We Collect
              </h2>
              <p>
                We collect various types of information to enhance your learning experience and manage our administrative services effectively:
              </p>

              <div className="space-y-3 pl-4 border-l-2 border-clinical-teal/30">
                <h3 className="font-semibold text-ink text-sm">2.1 Personal Information</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong>Registration Details:</strong> Name, email address, phone number, mailing address, and contact details for account creation and communication.</li>
                  <li><strong>Demographic Information:</strong> Age, gender, and educational background to tailor clinical courses.</li>
                  <li><strong>Payment Information:</strong> Financial data required to process course transactions safely.</li>
                </ul>

                <h3 className="font-semibold text-ink text-sm pt-2">2.2 Course and Academic Information</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong>Enrollment Data:</strong> Enrolled courses, start/end dates, and attendance records.</li>
                  <li><strong>Progress &amp; Performance:</strong> Course participation, grades, assessment results, and quiz scores.</li>
                  <li><strong>Certificates &amp; Credentials:</strong> Records of certifications earned through our LMS.</li>
                </ul>

                <h3 className="font-semibold text-ink text-sm pt-2">2.3 Usage &amp; Technical Data</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong>Technical Details:</strong> IP address, browser version, operating system, and device type.</li>
                  <li><strong>Log &amp; Cookie Data:</strong> Interaction timestamps, page visits, and session duration.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sec-3" className="space-y-3">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">3.</span> How We Use Your Information
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" />
                  <span><strong>Account Management:</strong> Account creation, portal access, and progress tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" />
                  <span><strong>Course Delivery:</strong> Delivering video modules, manage logistics, and instructor communication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" />
                  <span><strong>Personalized Experience:</strong> Recommending specialized pharmaceutical courses based on learning history.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sec-4" className="space-y-3">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">4.</span> How We Share Your Information
              </h2>
              <p>
                Your privacy is paramount. We do not sell or rent your personal data to third parties. Data is shared only with trusted service providers assisting LMS operations, under strict confidentiality obligations, or when required by legal authorities.
              </p>
            </section>

            {/* Section 5 & 6 */}
            <section id="sec-5" className="space-y-3">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">5 &amp; 6.</span> Data &amp; Payment Security
              </h2>
              <div className="bg-linen/60 border border-clinical-teal/20 p-5 rounded-card space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-clinical-teal uppercase">
                  <Lock className="w-4 h-4" /> SSL Encryption &amp; PCI-DSS Gateways
                </div>
                <p className="text-xs text-ink leading-relaxed">
                  All data transmitted between your device and our LMS is encrypted using 256-bit SSL technology. Payments are processed through PCI-DSS compliant financial gateways.
                </p>
              </div>
            </section>

            {/* Section 7 & 8 */}
            <section id="sec-7" className="space-y-3">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">7 &amp; 8.</span> Cookies &amp; Student Data Rights
              </h2>
              <p>
                You have the right to request access to, correction of, or deletion of your personal records stored in our LMS. Contact our administration desk to request data access or account removal.
              </p>
            </section>

            {/* Section 9, 10, 11 */}
            <section id="sec-9" className="space-y-3">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
                <span className="text-clinical-teal">9 - 11.</span> Children&apos;s Privacy &amp; Policy Updates
              </h2>
              <p>
                IMHS reserves the right to update this policy. Modifications will be posted on this page with an updated effective date.
              </p>
            </section>

            {/* Section 12 */}
            <section id="sec-12" className="space-y-4 bg-linen/40 border border-chart-grid p-6 rounded-card">
              <h2 className="text-lg font-display font-bold text-ink flex items-center gap-2">
                <Mail className="w-5 h-5 text-chart-red" /> 12. Contact Administration
              </h2>
              <p className="text-xs text-ink-muted">
                If you have questions regarding this Privacy Policy or student data practices, please contact our administrative desk:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono text-ink">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-clinical-teal" />
                  <span>info.imhsedu@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-clinical-teal" />
                  <span>+94 77 802 5050</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-clinical-teal shrink-0" />
                  <span>210/2/1, High Level Road, Maharagama, Sri Lanka</span>
                </div>
              </div>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}

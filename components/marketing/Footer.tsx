import React from "react";
import Link from "next/link";
import Image from "next/image";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, MapPin, MessageSquare } from "lucide-react";
import { createCourseInquiryWALink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-ink text-surface pt-16 pb-12 border-t-4 border-clinical-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Institute Blurb & Footer Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/footer-logo.png"
                alt="IMHS Institute Footer Logo"
                width={220}
                height={70}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sage-light text-xs leading-relaxed font-sans">
              IMHS (Institute of Medicine & Health Sciences) - established in 2019. Facilitating professional healthcare education with over 3,500+ successful graduates.
            </p>
            <div className="w-36 opacity-75">
              <VitalLine variant="divider" animated={false} />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-sage font-semibold mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-sage-light">
              <li>
                <Link href="/" className="hover:text-surface transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-surface transition-colors">
                  About Institute
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="hover:text-surface transition-colors">
                  Faculty & Mentors
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-surface transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="hover:text-surface transition-colors">
                  1-on-1 Faculty Mentorship
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-surface transition-colors">
                  Campus &amp; Convocation Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-surface transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-sage font-semibold mb-4">
              Clinical Administration
            </h4>
            <ul className="space-y-3 text-xs text-sage-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-chart-red shrink-0 mt-0.5" />
                <span>210/2/1, High Level Road, Maharagama, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-chart-red shrink-0" />
                <span>info.imhsedu@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-chart-red shrink-0" />
                <span>077 802 5050 (WhatsApp Admin)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Enrollment CTA */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-sage font-semibold mb-2">
              Admissions Desk
            </h4>
            <p className="text-sage-light text-xs leading-relaxed">
              Admissions are conducted via direct administrative inquiry. Contact our desk to submit application details and receive your portal login.
            </p>
            <Link
              href="/contact"
              className="inline-block w-full"
            >
              <Button variant="danger" className="w-full gap-2 font-semibold">
                <PhoneCall className="w-4 h-4" />
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ink-muted/50 flex flex-col md:flex-row items-center justify-between text-xs text-sage font-mono">
          <p>© {new Date().getFullYear()} Institute of Medicine and Health Sciences (IMHS). All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-surface transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-surface transition-colors">
              Terms of Enrollment
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

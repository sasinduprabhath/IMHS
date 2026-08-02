import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, UserPlus, CheckCircle2, Clock,
  ArrowRight, MessageSquare, TrendingUp, AlertTriangle,
  BarChart3, Activity, ShieldCheck, Database, ExternalLink,
  IdCard, ChevronRight
} from "lucide-react";

export const metadata = { title: "Admin Executive Dashboard — IMHS Console" };
export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);

  let totalStudents = 0;
  let totalCourses = 0;
  let publishedCourses = 0;
  let recentEnrollments: any[] = [];
  let contactInquiriesCount = 0;
  let recentCourses: any[] = [];
  let isDbConnected = true;

  try {
    const [students, courses, published, enrollments, inquiries, courseList] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.course.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.enrollment.findMany({
          take: 8,
          orderBy: { enrolledAt: "desc" },
          include: {
            user: { select: { id: true, studentId: true, name: true, email: true, phone: true } },
            course: { select: { id: true, title: true, slug: true } },
          },
        }),
        prisma.contactInquiry.count({ where: { resolved: false } }),
        prisma.course.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { enrollments: true } },
          },
        }),
      ]);

    totalStudents = students;
    totalCourses = courses;
    publishedCourses = published;
    recentEnrollments = enrollments;
    contactInquiriesCount = inquiries;
    recentCourses = courseList;
  } catch (error) {
    console.error("Database connection error:", error);
    isDbConnected = false;
  }

  const STAT_CARDS = [
    {
      label: "Active Students",
      value: totalStudents,
      sub: "Registered learner accounts",
      icon: Users,
      badge: "Active Roster",
      urgent: false,
    },
    {
      label: "Course Curriculum",
      value: `${publishedCourses} / ${totalCourses}`,
      sub: "Published / total programs",
      icon: BookOpen,
      badge: "Live Catalog",
      urgent: false,
    },
    {
      label: "Recent Onboardings",
      value: recentEnrollments.length,
      sub: "Newly enrolled candidates",
      icon: TrendingUp,
      badge: "Recent Enrollees",
      urgent: false,
    },
    {
      label: "Action Required",
      value: contactInquiriesCount,
      sub: "Pending student inquiries",
      icon: MessageSquare,
      badge: contactInquiriesCount > 0 ? "Action needed" : "All clear",
      urgent: contactInquiriesCount > 0,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── 1. Executive Banner ── */}
      <div className="bg-surface border border-chart-grid rounded-card p-6 md:p-8 shadow-paper relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] sm:text-xs text-chart-red uppercase font-bold tracking-wider bg-chart-red/10 border border-chart-red/20 px-3 py-0.5 rounded-full">
                INSTITUTIONAL ADMINISTRATION
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">
                <Database className="w-3.5 h-3.5 text-green-600" /> MySQL Live Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
              Executive Administration Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-sans max-w-2xl leading-relaxed">
              Manage clinical programs, official student Reg IDs, course access holds, and admissions tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/students/new">
              <Button className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold shadow-md text-xs h-10 px-4">
                <UserPlus className="w-4 h-4" /> Onboard Student
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button variant="outline" className="gap-2 font-semibold bg-white border-chart-grid hover:border-clinical-teal text-xs h-10 px-4">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Create Program
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Performance Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, badge, urgent }) => (
          <div
            key={label}
            className={`bg-surface border rounded-card p-5 space-y-3.5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group ${
              urgent
                ? "border-chart-red/40 bg-chart-red/5"
                : "border-chart-grid hover:border-clinical-teal/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-sage tracking-wider font-medium">{label}</span>
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110 ${
                  urgent
                    ? "bg-chart-red/10 border-chart-red/20 text-chart-red"
                    : "bg-clinical-teal/10 border-clinical-teal/20 text-clinical-teal"
                }`}
              >
                {urgent ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
            </div>

            <div className={`text-2xl sm:text-3xl font-mono font-bold ${urgent ? "text-chart-red" : "text-ink"}`}>
              {value}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-chart-grid/50">
              <p className="text-[11px] text-ink-muted font-sans truncate">{sub}</p>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  urgent
                    ? "bg-chart-red text-white"
                    : "bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/20"
                }`}
              >
                {badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Recent Student Registrations & Program Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Student Registrations (Mobile Cards + Desktop Table) */}
        <div className="lg:col-span-2 bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
          <div className="flex items-center justify-between px-5 py-4 border-b border-chart-grid bg-linen/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-clinical-teal/10 border border-clinical-teal/20 rounded-md flex items-center justify-center">
                <Users className="w-4 h-4 text-clinical-teal" />
              </div>
              <div>
                <h2 className="text-base font-display font-semibold text-ink">Recent Onboarded Students</h2>
                <p className="text-[11px] text-sage font-mono">Latest student registrations synced to database</p>
              </div>
            </div>

            <Link
              href="/admin/students"
              className="flex items-center gap-1 text-xs font-mono text-clinical-teal hover:text-chart-red font-semibold transition-colors shrink-0"
            >
              All Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="w-10 h-10 text-sage/40 mx-auto" />
              <p className="text-xs font-mono text-sage">No recent student registrations found.</p>
              <Link href="/admin/students/new">
                <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-2">
                  <UserPlus className="w-3.5 h-3.5" /> Add Student
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {/* 📱 Mobile Responsive Cards (< md screens) */}
              <div className="block md:hidden divide-y divide-chart-grid/60">
                {recentEnrollments.map((enr) => (
                  <Link
                    key={enr.id}
                    href={`/admin/students/${enr.user.id}`}
                    className="block p-4 space-y-2.5 hover:bg-clinical-teal/5 transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-clinical-teal"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-clinical-teal/15 border border-clinical-teal/30 flex items-center justify-center font-bold text-clinical-teal text-sm shrink-0">
                          {enr.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-sm group-hover:text-clinical-teal transition-colors">
                            {enr.user.name}
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-mono text-clinical-teal font-bold bg-clinical-teal/10 border border-clinical-teal/20 px-1.5 py-0.2 rounded">
                            Reg ID: {enr.user.studentId || `IWPH-${enr.user.id.slice(0, 5)}`}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-sage group-hover:text-clinical-teal shrink-0 mt-1" />
                    </div>

                    <div className="text-xs font-mono text-ink-muted space-y-1 bg-linen/50 p-2.5 rounded border border-chart-grid/50">
                      <div className="truncate text-ink font-sans font-medium">{enr.user.email}</div>
                      <div className="text-clinical-teal text-[11px]">{enr.user.phone}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono text-[11px] text-clinical-teal font-bold truncate max-w-[200px]">
                        {enr.course.title}
                      </span>
                      <span className="text-[10px] font-mono text-sage">
                        {new Date(enr.enrolledAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 💻 Desktop Table View (>= md screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-chart-grid bg-linen/30 text-sage uppercase font-mono text-[10px]">
                      <th className="px-5 py-3">Student Name & Reg ID</th>
                      <th className="px-5 py-3">Contact Information</th>
                      <th className="px-5 py-3">Enrolled Program</th>
                      <th className="px-5 py-3">Enrolled Date</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chart-grid/50">
                    {recentEnrollments.map((enr) => (
                      <tr
                        key={enr.id}
                        className="hover:bg-clinical-teal/5 transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-clinical-teal cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-clinical-teal/15 border border-clinical-teal/30 flex items-center justify-center font-bold text-clinical-teal text-xs group-hover:scale-105 transition-transform">
                              {enr.user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-ink text-sm group-hover:text-clinical-teal transition-colors">
                                {enr.user.name}
                              </div>
                              <span className="inline-block mt-0.5 text-[10px] font-mono text-clinical-teal font-bold bg-clinical-teal/10 border border-clinical-teal/20 px-1.5 py-0.2 rounded">
                                Reg ID: {enr.user.studentId || `IWPH-${enr.user.id.slice(0, 5)}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-ink-muted">
                          <div className="text-xs text-ink font-sans font-medium">{enr.user.email}</div>
                          <div className="text-[11px] text-clinical-teal font-mono">{enr.user.phone}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-clinical-teal text-xs block leading-snug">
                            {enr.course.title}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-sage text-xs">
                          {new Date(enr.enrolledAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Link href={`/admin/students/${enr.user.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-3 font-semibold border-clinical-teal/30 text-clinical-teal hover:bg-clinical-teal/10 shadow-xs"
                            >
                              Profile
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Program Distribution & System Shortcuts */}
        <div className="space-y-6">

          {/* Program Distribution */}
          <div className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
            <div className="flex items-center justify-between border-b border-chart-grid pb-3">
              <h3 className="text-sm font-display font-semibold text-ink flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Program Distribution
              </h3>
              <Link href="/admin/courses" className="text-[11px] font-mono text-clinical-teal hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {recentCourses.length === 0 ? (
              <p className="text-xs font-mono text-sage py-4 text-center">No courses configured.</p>
            ) : (
              <div className="space-y-3.5">
                {recentCourses.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-ink leading-snug">{c.title}</span>
                      <span className="font-mono text-[11px] text-clinical-teal font-bold shrink-0">
                        {c._count?.enrollments || 0} students
                      </span>
                    </div>
                    <div className="h-2 w-full bg-linen rounded-full overflow-hidden border border-chart-grid/50">
                      <div
                        className="h-full bg-clinical-teal rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(12, ((c._count?.enrollments || 0) / Math.max(1, totalStudents)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-clinical-teal-surface border border-clinical-teal/20 rounded-card p-5 space-y-3 shadow-paper">
            <h3 className="text-xs font-mono uppercase text-clinical-teal font-bold tracking-wider">
              System Management Shortcuts
            </h3>
            <div className="space-y-2">
              <Link href="/admin/students" className="block">
                <div className="p-3 bg-surface border border-chart-grid rounded hover:border-clinical-teal/40 transition-all hover:translate-x-0.5 flex items-center justify-between shadow-xs">
                  <span className="text-xs font-semibold text-ink">Student Directory & Reg IDs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage" />
                </div>
              </Link>
              <Link href="/admin/courses/new" className="block">
                <div className="p-3 bg-surface border border-chart-grid rounded hover:border-clinical-teal/40 transition-all hover:translate-x-0.5 flex items-center justify-between shadow-xs">
                  <span className="text-xs font-semibold text-ink font-sans">Add New Course Certification</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage" />
                </div>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

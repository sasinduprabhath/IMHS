import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { VitalLine } from "@/components/ui/vital-line";
import {
  Users, BookOpen, UserPlus, CheckCircle2, Clock,
  ArrowRight, MessageSquare, TrendingUp, AlertTriangle,
  BarChart3, Activity, ShieldCheck, FileSpreadsheet, Sparkles,
  Database, Server, RefreshCw
} from "lucide-react";

export const metadata = { title: "Admin Executive Dashboard — IMHS Console" };

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
          take: 6,
          orderBy: { enrolledAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            course: { select: { id: true, title: true, slug: true } },
          },
        }),
        prisma.contactInquiry.count({ where: { resolved: false } }),
        prisma.course.findMany({
          take: 4,
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
      color: "clinical-teal",
      badge: "Active",
    },
    {
      label: "Course Curriculum",
      value: `${publishedCourses} / ${totalCourses}`,
      sub: "Published / total programs",
      icon: BookOpen,
      color: "clinical-teal",
      badge: "Live Catalog",
    },
    {
      label: "Recent Onboardings",
      value: recentEnrollments.length,
      sub: "Newly enrolled candidates",
      icon: TrendingUp,
      color: "clinical-teal",
      badge: "Recent",
    },
    {
      label: "Action Required",
      value: contactInquiriesCount,
      sub: "Pending student inquiries",
      icon: MessageSquare,
      color: contactInquiriesCount > 0 ? "chart-red" : "clinical-teal",
      badge: contactInquiriesCount > 0 ? "Action needed" : "All clear",
      urgent: contactInquiriesCount > 0,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header Banner ── */}
      <div className="bg-surface border border-chart-grid rounded-card p-6 md:p-8 shadow-paper relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-chart-red uppercase font-semibold tracking-wider bg-chart-red/10 border border-chart-red/20 px-3 py-1 rounded-full">
                INSTITUTIONAL ADMINISTRATION
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <Database className="w-3.5 h-3.5" /> MySQL Engine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
              Executive Administration Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-sans max-w-2xl leading-relaxed">
              Manage clinical programs, student credentials, and admissions tracking with real-time database synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/students/new">
              <Button className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold shadow-md">
                <UserPlus className="w-4 h-4" /> Onboard Student
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button variant="outline" className="gap-2 font-semibold bg-white border-chart-grid hover:border-clinical-teal">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Create Program
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

            <div className={`text-3xl font-mono font-bold ${urgent ? "text-chart-red" : "text-ink"}`}>
              {value}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-chart-grid/50">
              <p className="text-[11px] text-ink-muted font-sans">{sub}</p>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  urgent
                    ? "bg-chart-red text-white"
                    : "bg-clinical-teal-surface text-clinical-teal border border-clinical-teal/20"
                }`}
              >
                {badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dashboard Grid (Recent Activity & Course Performance) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Student Registrations */}
        <div className="lg:col-span-2 bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
          <div className="flex items-center justify-between px-6 py-4 border-b border-chart-grid bg-linen/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-clinical-teal/10 border border-clinical-teal/20 rounded-md flex items-center justify-center">
                <Users className="w-4 h-4 text-clinical-teal" />
              </div>
              <div>
                <h2 className="text-base font-display font-semibold text-ink">Recent Onboarded Students</h2>
                <p className="text-[11px] text-sage font-mono">Latest student profiles added to database</p>
              </div>
            </div>
            <Link
              href="/admin/students"
              className="flex items-center gap-1 text-xs font-mono text-clinical-teal hover:text-chart-red font-semibold transition-colors"
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-chart-grid bg-linen/30 text-sage uppercase font-mono text-[10px]">
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Program</th>
                    <th className="px-5 py-3">Enrolled</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chart-grid/50">
                  {recentEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-linen/40 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-clinical-teal-surface border border-clinical-teal/30 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-clinical-teal font-mono">
                              {enr.user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-ink block">{enr.user.name}</span>
                            <span className="text-[10px] font-mono text-sage">ID: {enr.user.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-ink-muted">
                        <div className="text-xs text-ink">{enr.user.email}</div>
                        <div className="text-[10px] text-sage">{enr.user.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-clinical-teal text-xs line-clamp-1">
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
                            className="text-[11px] h-7 px-3 opacity-80 group-hover:opacity-100 transition-opacity bg-white hover:border-clinical-teal"
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
          )}
        </div>

        {/* Right 1 Col: Course Overview & System Health */}
        <div className="space-y-6">

          {/* Program Distribution */}
          <div className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
            <div className="flex items-center justify-between border-b border-chart-grid pb-3">
              <h3 className="text-sm font-display font-semibold text-ink flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Program Distribution
              </h3>
              <Link href="/admin/courses" className="text-[11px] font-mono text-clinical-teal hover:underline">
                Manage
              </Link>
            </div>

            {recentCourses.length === 0 ? (
              <p className="text-xs font-mono text-sage py-4 text-center">No courses configured.</p>
            ) : (
              <div className="space-y-3.5">
                {recentCourses.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink truncate max-w-[180px]">{c.title}</span>
                      <span className="font-mono text-[11px] text-clinical-teal font-bold">
                        {c._count?.enrollments || 0} students
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-linen rounded-full overflow-hidden border border-chart-grid/50">
                      <div
                        className="h-full bg-clinical-teal rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(15, ((c._count?.enrollments || 0) / Math.max(1, totalStudents)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Links */}
          <div className="bg-clinical-teal-surface border border-clinical-teal/20 rounded-card p-5 space-y-3 shadow-paper">
            <h3 className="text-xs font-mono uppercase text-clinical-teal font-bold tracking-wider">
              System Management Shortcuts
            </h3>
            <div className="space-y-2">
              <Link href="/admin/students" className="block">
                <div className="p-3 bg-surface border border-chart-grid rounded hover:border-clinical-teal/40 transition-colors flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">Student Accounts & Reset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage" />
                </div>
              </Link>
              <Link href="/admin/courses/new" className="block">
                <div className="p-3 bg-surface border border-chart-grid rounded hover:border-clinical-teal/40 transition-colors flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">Add New Certification</span>
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

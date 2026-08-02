import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  UserPlus,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  Activity,
  ChevronRight,
  IdCard,
} from "lucide-react";

export const metadata = { title: "Admin Executive Dashboard — IMHS Console" };
export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);

  let totalStudents = 0;
  let totalCourses = 0;
  let publishedCourses = 0;
  let recentStudents: any[] = [];
  let contactInquiriesCount = 0;
  let recentCourses: any[] = [];
  let isDbConnected = true;

  try {
    const [students, courses, published, studentList, inquiries, courseList] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.course.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.user.findMany({
          where: { role: "STUDENT" },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            enrollments: { include: { course: { select: { id: true, title: true } } } },
          },
        }),
        prisma.contactInquiry.count({ where: { resolved: false } }),
        prisma.course.findMany({
          take: 8,
          orderBy: { enrollments: { _count: "desc" } },
          include: { _count: { select: { enrollments: true } } },
        }),
      ]);

    totalStudents = students;
    totalCourses = courses;
    publishedCourses = published;
    recentStudents = studentList;
    contactInquiriesCount = inquiries;
    recentCourses = courseList;
  } catch (error) {
    console.error("Database connection error:", error);
    isDbConnected = false;
  }

  const maxEnrolled = Math.max(...recentCourses.map((c) => c._count?.enrollments || 0), 1);

  return (
    <div className="space-y-6">

      {/* ── 1. Executive Banner ─────────────────────────────────────────── */}
      <div className="bg-white border border-chart-grid rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-clinical-teal/3 via-transparent to-transparent pointer-events-none rounded-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-chart-red border border-chart-red/30 bg-chart-red/8 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3" /> Institutional Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-tight">
              Executive Administration Dashboard
            </h1>
            <p className="text-sm text-ink-muted font-sans max-w-xl leading-relaxed">
              Manage clinical programs, official student Reg IDs, course access holds, and admissions tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin/students/new">
              <Button className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold shadow-sm text-sm h-10 px-5 rounded-xl">
                <UserPlus className="w-4 h-4" /> Onboard Student
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button variant="outline" className="gap-2 font-semibold bg-white border-chart-grid hover:border-clinical-teal hover:text-clinical-teal text-sm h-10 px-5 rounded-xl transition-colors">
                <BookOpen className="w-4 h-4" /> Create Program
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card: Active Students */}
        <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">Active Students</span>
            <div className="w-9 h-9 rounded-xl bg-clinical-teal/10 flex items-center justify-center group-hover:bg-clinical-teal/20 transition-colors">
              <Users className="w-4 h-4 text-clinical-teal" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-ink mb-3">
            {isDbConnected ? totalStudents.toLocaleString() : "—"}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-chart-grid/60">
            <p className="text-xs text-ink-muted">Registered learner accounts</p>
            <Link href="/admin/students">
              <span className="text-[10px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-0.5 rounded-full hover:bg-clinical-teal/20 transition-colors cursor-pointer">
                Active Roster
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Course Curriculum */}
        <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">Course Curriculum</span>
            <div className="w-9 h-9 rounded-xl bg-clinical-teal/10 flex items-center justify-center group-hover:bg-clinical-teal/20 transition-colors">
              <BookOpen className="w-4 h-4 text-clinical-teal" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-ink mb-3">
            {isDbConnected ? (
              <span>
                {publishedCourses}{" "}
                <span className="text-xl text-sage font-normal">/ {totalCourses}</span>
              </span>
            ) : "—"}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-chart-grid/60">
            <p className="text-xs text-ink-muted">Published / total programs</p>
            <Link href="/admin/courses">
              <span className="text-[10px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-0.5 rounded-full hover:bg-clinical-teal/20 transition-colors cursor-pointer">
                Live Catalog
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Recent Onboardings */}
        <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">Recent Onboardings</span>
            <div className="w-9 h-9 rounded-xl bg-clinical-teal/10 flex items-center justify-center group-hover:bg-clinical-teal/20 transition-colors">
              <TrendingUp className="w-4 h-4 text-clinical-teal" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-ink mb-3">
            {isDbConnected ? recentStudents.length : "—"}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-chart-grid/60">
            <p className="text-xs text-ink-muted">Newly enrolled candidates</p>
            <Link href="/admin/students">
              <span className="text-[10px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-0.5 rounded-full hover:bg-clinical-teal/20 transition-colors cursor-pointer">
                Recent Enrollees
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Action Required */}
        <div className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group ${
          contactInquiriesCount > 0
            ? "bg-chart-red/4 border-chart-red/30"
            : "bg-white border-chart-grid"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
              contactInquiriesCount > 0 ? "text-chart-red/70" : "text-sage"
            }`}>Action Required</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              contactInquiriesCount > 0
                ? "bg-chart-red/10 group-hover:bg-chart-red/20"
                : "bg-linen group-hover:bg-linen/70"
            }`}>
              <AlertTriangle className={`w-4 h-4 ${contactInquiriesCount > 0 ? "text-chart-red" : "text-sage"}`} />
            </div>
          </div>
          <div className={`text-3xl font-mono font-bold mb-3 ${
            contactInquiriesCount > 0 ? "text-chart-red" : "text-ink"
          }`}>
            {isDbConnected ? contactInquiriesCount.toLocaleString() : "—"}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-chart-grid/60">
            <p className="text-xs text-ink-muted">Pending student inquiries</p>
            <Link href="/admin/inquiries">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                contactInquiriesCount > 0
                  ? "text-white bg-chart-red hover:bg-chart-red-hover"
                  : "text-sage bg-linen border border-chart-grid"
              }`}>
                {contactInquiriesCount > 0 ? "Action needed" : "All clear"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Main Content: Table + Sidebar ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left 2/3: Recent Students Table ── */}
        <div className="lg:col-span-2 bg-white border border-chart-grid rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-chart-grid">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-clinical-teal" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Recent Onboarded Students</h2>
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

          {recentStudents.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Users className="w-10 h-10 text-sage/30 mx-auto" />
              <p className="text-xs font-mono text-sage">No recent student registrations found.</p>
              <Link href="/admin/students/new">
                <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-2 rounded-xl">
                  <UserPlus className="w-3.5 h-3.5" /> Add Student
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="block md:hidden divide-y divide-chart-grid/60">
                {recentStudents.map((st) => (
                  <Link
                    key={st.id}
                    href={`/admin/students/${st.id}`}
                    className="p-4 block space-y-2 hover:bg-linen/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-clinical-teal/15 border border-clinical-teal/30 flex items-center justify-center font-bold text-clinical-teal text-sm">
                          {st.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-ink">{st.name}</p>
                          <span className="text-[10px] font-mono text-clinical-teal font-bold bg-clinical-teal/10 px-1.5 py-0.5 rounded">
                            Reg ID: {st.studentId || `IMPH${st.id.slice(0, 4).toUpperCase()}`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sage" />
                    </div>
                    <p className="text-xs text-ink-muted">{st.email}</p>
                  </Link>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-chart-grid bg-linen/40">
                      <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Student Name &amp; Reg ID
                      </th>
                      <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Contact Information
                      </th>
                      <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Enrolled Program(s)
                      </th>
                      <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Onboarded Date
                      </th>
                      <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chart-grid/50">
                    {recentStudents.map((st) => (
                      <tr
                        key={st.id}
                        className="hover:bg-linen/30 transition-colors group"
                      >
                        {/* Student name + reg ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-clinical-teal/15 border border-clinical-teal/20 flex items-center justify-center font-bold text-clinical-teal text-sm shrink-0">
                              {st.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-ink leading-snug group-hover:text-clinical-teal transition-colors">
                                {st.name}
                              </p>
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-mono text-clinical-teal font-bold bg-clinical-teal/10 border border-clinical-teal/20 px-1.5 py-0.5 rounded">
                                <IdCard className="w-2.5 h-2.5" />
                                Reg ID: {st.studentId || `IMPH${st.id.slice(0, 4).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <p className="text-xs text-ink font-medium leading-snug">{st.email}</p>
                          <p className="text-[11px] text-clinical-teal font-mono mt-0.5">{st.phone || "—"}</p>
                        </td>

                        {/* Courses */}
                        <td className="px-5 py-4 max-w-[200px]">
                          {st.enrollments.length === 0 ? (
                            <span className="text-[11px] font-mono text-sage/60 italic">No enrollments</span>
                          ) : (
                            <div className="space-y-1">
                              {st.enrollments.slice(0, 2).map((e: any) => (
                                <span
                                  key={e.course.id}
                                  className="block text-[11px] font-mono text-clinical-teal bg-clinical-teal/8 border border-clinical-teal/20 px-2 py-0.5 rounded font-semibold leading-snug"
                                >
                                  {e.course.title.length > 36
                                    ? e.course.title.slice(0, 36) + "…"
                                    : e.course.title}
                                </span>
                              ))}
                              {st.enrollments.length > 2 && (
                                <span className="text-[10px] font-mono text-sage">
                                  +{st.enrollments.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono text-ink">
                            {new Date(st.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <Link href={`/admin/students/${st.id}`}>
                            <button className="text-[11px] font-semibold font-mono text-ink border border-chart-grid hover:border-clinical-teal hover:text-clinical-teal px-3 py-1.5 rounded-lg transition-all duration-150 bg-white">
                              Profile
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Table footer */}
                <div className="px-5 py-3 border-t border-chart-grid/60 bg-linen/20 flex items-center justify-between">
                  <p className="text-[11px] font-mono text-sage">
                    Showing {recentStudents.length} most recent registrations
                  </p>
                  <Link
                    href="/admin/students"
                    className="text-[11px] font-mono font-bold text-clinical-teal hover:underline flex items-center gap-1"
                  >
                    View all {totalStudents} students <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right 1/3: Program Distribution ── */}
        <div className="space-y-4">
          <div className="bg-white border border-chart-grid rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-chart-grid">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-clinical-teal" />
                Program Distribution
              </h3>
              <Link href="/admin/courses" className="text-[11px] font-mono text-clinical-teal hover:underline font-semibold">
                Manage
              </Link>
            </div>

            <div className="px-5 py-4 space-y-4">
              {recentCourses.length === 0 ? (
                <p className="text-xs font-mono text-sage text-center py-6">No courses configured.</p>
              ) : (
                recentCourses.map((c) => {
                  const count = c._count?.enrollments || 0;
                  const pct = Math.min(100, Math.round((count / maxEnrolled) * 100));
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-ink font-medium leading-snug flex-1 min-w-0">
                          {c.title}
                        </p>
                        <span className="text-[11px] font-mono font-bold text-clinical-teal shrink-0">
                          {count} students
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-linen rounded-full overflow-hidden">
                        <div
                          className="h-full bg-clinical-teal rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Links card */}
          <div className="bg-white border border-chart-grid rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-chart-grid">
              <h3 className="text-xs font-mono uppercase tracking-wider text-sage font-bold">
                Quick Actions
              </h3>
            </div>
            <div className="divide-y divide-chart-grid/60">
              {[
                { href: "/admin/students/new", label: "Onboard New Student", icon: UserPlus, color: "text-chart-red" },
                { href: "/admin/courses/new", label: "Create New Course", icon: BookOpen, color: "text-clinical-teal" },
                { href: "/admin/inquiries", label: `Inquiries (${contactInquiriesCount} pending)`, icon: MessageSquare, color: "text-chart-red", urgent: contactInquiriesCount > 0 },
                { href: "/admin/students", label: "Student Directory", icon: Users, color: "text-clinical-teal" },
              ].map(({ href, label, icon: Icon, color, urgent }) => (
                <Link key={href} href={href}>
                  <div className={`flex items-center justify-between px-5 py-3 hover:bg-linen/40 transition-colors group ${urgent ? "bg-chart-red/4" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                      <span className={`text-xs font-medium ${urgent ? "text-chart-red font-semibold" : "text-ink"}`}>
                        {label}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-sage group-hover:text-ink transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

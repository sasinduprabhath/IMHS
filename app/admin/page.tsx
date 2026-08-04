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

export const metadata = { title: "Admin Executive Dashboard - IMHS Console" };
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
      <div className="relative rounded-2xl overflow-hidden p-7 md:p-8"
        style={{
          background: "linear-gradient(135deg, #0A1628 0%, #0C1A30 50%, #0d2040 100%)",
          boxShadow: "0 8px 32px rgba(10,18,30,.25), 0 2px 8px rgba(10,18,30,.15)",
        }}>
        {/* Mesh overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(14,87,164,.18) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 5% 100%, rgba(241,103,38,.12) 0%, transparent 50%)"
          }} />
        {/* 3px brand bar at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F16726] via-[#0E57A4] to-[#F16726]" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-[#FB923C] border border-[#F16726]/30 bg-[#F16726]/10 px-3 py-1 rounded-pill">
              <Activity className="w-3 h-3" /> Institutional Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
              Executive Administration Dashboard
            </h1>
            <p className="text-sm text-white/55 font-sans max-w-xl leading-relaxed">
              Manage clinical programs, official student Reg IDs, course access holds, and admissions tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin/students/new">
              <Button className="gap-2 text-white border-0 font-semibold text-sm h-10 px-5 rounded-xl"
                style={{ background: "linear-gradient(135deg, #F16726 0%, #D95316 100%)", boxShadow: "0 4px 12px rgba(241,103,38,.30)" }}>
                <UserPlus className="w-4 h-4" /> Onboard Student
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button className="gap-2 font-semibold text-white border border-white/15 bg-white/10 hover:bg-white/18 text-sm h-10 px-5 rounded-xl transition-all backdrop-blur-sm">
                <BookOpen className="w-4 h-4" /> Create Program
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card: Active Students */}
        <div className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-card group"
          style={{ border: "1px solid rgba(14,87,164,.14)", boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: "#0E57A4" }}>Active Students</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "rgba(14,87,164,.08)" }}>
              <Users className="w-4 h-4" style={{ color: "#0E57A4" }} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-ink mb-3">
            {isDbConnected ? totalStudents.toLocaleString() : "-"}
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
            <p className="text-xs text-ink-muted truncate min-w-0">Registered learners</p>
            <Link href="/admin/students" className="shrink-0">
              <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] border border-[#BFDBFE] px-2.5 py-0.5 rounded-pill hover:bg-[#BFDBFE]/50 transition-colors cursor-pointer whitespace-nowrap">
                Active Roster
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Course Curriculum */}
        <div className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-card group"
          style={{ border: "1px solid rgba(99,102,241,.14)", boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: "#6366F1" }}>Course Curriculum</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "rgba(99,102,241,.08)" }}>
              <BookOpen className="w-4 h-4" style={{ color: "#6366F1" }} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-ink mb-3">
            {isDbConnected ? (
              <span>
                {publishedCourses}{" "}
                <span className="text-xl text-sage font-normal">/ {totalCourses}</span>
              </span>
            ) : "-"}
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
            <p className="text-xs text-ink-muted truncate min-w-0">Published programs</p>
            <Link href="/admin/courses" className="shrink-0">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-pill hover:opacity-80 transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: "#6366F1", background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)" }}>
                Live Catalog
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Recent Onboardings */}
        <div className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-card group"
          style={{ border: "1px solid rgba(16,185,129,.14)", boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: "#10B981" }}>Recent Onboardings</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "rgba(16,185,129,.08)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#10B981" }} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-ink mb-3">
            {isDbConnected ? recentStudents.length : "-"}
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
            <p className="text-xs text-ink-muted truncate min-w-0">Newly enrolled</p>
            <Link href="/admin/students" className="shrink-0">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-pill hover:opacity-80 transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: "#10B981", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)" }}>
                Recent Enrollees
              </span>
            </Link>
          </div>
        </div>

        {/* Card: Action Required */}
        <div className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group ${contactInquiriesCount > 0
            ? "bg-chart-red/4 border-chart-red/30"
            : "bg-white border-chart-grid"
          }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${contactInquiriesCount > 0 ? "text-chart-red/70" : "text-sage"
              }`}>Action Required</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${contactInquiriesCount > 0
                ? "bg-chart-red/10 group-hover:bg-chart-red/20"
                : "bg-linen group-hover:bg-linen/70"
              }`}>
              <AlertTriangle className={`w-4 h-4 ${contactInquiriesCount > 0 ? "text-chart-red" : "text-sage"}`} />
            </div>
          </div>
          <div className={`text-3xl font-mono font-bold mb-3 ${contactInquiriesCount > 0 ? "text-chart-red" : "text-ink"
            }`}>
            {isDbConnected ? contactInquiriesCount.toLocaleString() : "-"}
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-chart-grid/60">
            <p className="text-xs text-ink-muted truncate min-w-0">Pending inquiries</p>
            <Link href="/admin/inquiries" className="shrink-0">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors whitespace-nowrap ${contactInquiriesCount > 0
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
                        <div className="w-9 h-9 rounded-full bg-clinical-teal/15 border border-clinical-teal/30 flex items-center justify-center font-bold text-clinical-teal text-sm shrink-0">
                          {st.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-ink">{st.name}</p>
                          <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-mono text-[#0E57A4] font-bold bg-[#EBF3FA] border border-[#BFDBFE] px-2 py-0.5 rounded-md whitespace-nowrap">
                            <IdCard className="w-3 h-3 text-[#0E57A4] shrink-0" />
                            <span>Reg ID: {st.studentId || `IWPH${st.id.slice(0, 4).toUpperCase()}`}</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sage shrink-0" />
                    </div>
                    <p className="text-xs text-ink-muted">{st.email}</p>
                  </Link>
                ))}
              </div>

              {/* Desktop table view (strictly no horizontal scrollbar) */}
              <div className="hidden md:block overflow-hidden w-full">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-chart-grid bg-linen/40">
                      <th className="w-[32%] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Student Name &amp; Reg ID
                      </th>
                      <th className="w-[26%] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Contact Information
                      </th>
                      <th className="w-[22%] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Enrolled Program(s)
                      </th>
                      <th className="w-[12%] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold">
                        Onboarded Date
                      </th>
                      <th className="w-[8%] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-sage font-bold text-right">
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
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-clinical-teal/15 border border-clinical-teal/20 flex items-center justify-center font-bold text-clinical-teal text-sm shrink-0">
                              {st.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-ink leading-snug group-hover:text-clinical-teal transition-colors truncate max-w-[170px]" title={st.name}>
                                {st.name}
                              </p>
                              <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-mono text-[#0E57A4] font-bold bg-[#EBF3FA] border border-[#BFDBFE] px-2 py-0.5 rounded-md whitespace-nowrap shadow-xs">
                                <IdCard className="w-3 h-3 text-[#0E57A4] shrink-0" />
                                <span>Reg ID: {st.studentId || `IWPH${st.id.slice(0, 4).toUpperCase()}`}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <p className="text-xs text-ink font-medium leading-snug truncate max-w-[180px]" title={st.email}>{st.email}</p>
                          <p className="text-[11px] text-clinical-teal font-mono mt-0.5">{st.phone || "-"}</p>
                        </td>

                        {/* Courses */}
                        <td className="px-4 py-3.5 max-w-[180px]">
                          {st.enrollments.length === 0 ? (
                            <span className="text-[10px] font-mono text-sage/60 bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#E2E8F0] inline-block">No enrollments</span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                title={st.enrollments[0].course.title}
                                className="text-[10px] font-mono bg-[#EBF3FA] text-[#0E57A4] border border-[#BFDBFE] px-2 py-0.5 rounded font-semibold max-w-[150px] truncate block"
                              >
                                {st.enrollments[0].course.title}
                              </span>
                              {st.enrollments.length > 1 && (
                                <span
                                  title={st.enrollments.slice(1).map((e: any) => e.course.title).join(" | ")}
                                  className="text-[10px] font-mono bg-[#F1F5F9] text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-semibold cursor-help"
                                >
                                  +{st.enrollments.length - 1} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-mono text-ink">
                            {new Date(st.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link href={`/admin/students/${st.id}`}>
                            <button className="text-[11px] font-semibold font-mono text-ink border border-chart-grid hover:border-clinical-teal hover:text-clinical-teal px-3 py-1.5 rounded-lg transition-all duration-150 bg-white shadow-xs">
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

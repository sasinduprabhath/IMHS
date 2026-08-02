import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { DoseCurve } from "@/components/marketing/DoseCurve";
import { MolecularGridBackground } from "@/components/marketing/MolecularGridBackground";
import {
  BookOpen,
  PhoneCall,
  CheckCircle2,
  Lock,
  FileText,
  Video,
  Award,
  ArrowLeft,
  Clock,
  Users,
  HelpCircle,
  GraduationCap,
  MessageCircle,
  Star,
  Layers,
} from "lucide-react";

export const revalidate = 60;

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  try {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) return { title: "Course Not Found - IMHS" };
    return {
      title: `${course.title} - IMHS`,
      description: course.description,
    };
  } catch {
    return { title: "Course Details - IMHS" };
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  let course: any = null;
  let faculty: any[] = [];

  try {
    const [cData, fData] = await Promise.all([
      prisma.course.findUnique({
        where: { slug },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
          announcements: { orderBy: { createdAt: "desc" } },
          instructors: { include: { facultyMember: true } },
        },
      }),
      prisma.facultyMember.findMany({ take: 4, orderBy: { order: "asc" } }),
    ]);
    course = cData;
    faculty = fData;
  } catch (error) {
    console.error("Course detail DB connection error (MySQL):", error);
  }

  if (!course || !course.published) notFound();

  const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();
  const allLessons = course.chapters.flatMap((ch: any) => ch.lessons);
  const questionsCount = allLessons.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
  const lessonsCount = allLessons.length - questionsCount;
  const displayInstructors =
    course.instructors && course.instructors.length > 0
      ? course.instructors.map((i: any) => i.facultyMember)
      : faculty;

  const coverSrc = course.coverImage
    ? formatGoogleDriveImageUrl(course.coverImage) || course.coverImage
    : null;

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <MolecularGridBackground />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Back breadcrumb — tight to top, no wasted space */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-sage hover:text-clinical-teal transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Course Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left: course identity */}
            <div className="lg:col-span-8 space-y-4">
              {/* Breadcrumb badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {courseCode}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sage border border-sage/25 bg-sage/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Award className="w-3 h-3" /> Accredited Clinical Certification
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink leading-tight">
                {course.title}
              </h1>

              {/* Quick stats row */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Layers className="w-3.5 h-3.5 text-clinical-teal" />
                  {course.chapters.length} Chapters
                </span>
                <span className="text-chart-grid">·</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Video className="w-3.5 h-3.5 text-clinical-teal" />
                  {lessonsCount} Lessons
                </span>
                {questionsCount > 0 && (
                  <>
                    <span className="text-chart-grid">·</span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                      {questionsCount} Practice Questions
                    </span>
                  </>
                )}
                <span className="text-chart-grid">·</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Users className="w-3.5 h-3.5 text-clinical-teal" />
                  {course.totalEnrolled || 450}+ Enrolled
                </span>
                <span className="text-chart-grid">·</span>
                <span className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-chart-red text-chart-red" />)}
                </span>
              </div>

              {/* Dose Curve motif */}
              <div className="pt-2 w-48">
                <DoseCurve variant="divider" />
              </div>
            </div>

            {/* Right: price teaser (desktop only) */}
            <div className="lg:col-span-4 hidden lg:flex justify-end items-end">
              <div className="text-right space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-sage">Total Course Fee</p>
                <p className="text-4xl font-mono font-bold text-clinical-teal">{formatCurrency(course.price)}</p>
                <p className="text-[11px] text-ink-muted">Lifetime portal access & certification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COL: Description + Syllabus + Instructors ── */}
          <div className="lg:col-span-8 space-y-8">

            {/* About this course */}
            <div className="bg-white border border-chart-grid rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-sage font-bold">
                About This Course
              </h2>
              <p className="text-base text-ink-muted leading-relaxed font-sans">
                {course.description}
              </p>
            </div>

            {/* What you'll get */}
            <div className="bg-white border border-chart-grid rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-sage font-bold mb-4">
                What's Included
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Video, text: "Domain-locked HD video lectures" },
                  { icon: FileText, text: "PDF lab reference guides & case studies" },
                  { icon: Award, text: "Official IMHS Completion Certificate" },
                  { icon: MessageCircle, text: "WhatsApp administrator support" },
                  { icon: Clock, text: `${course.enrollmentValidity || "Lifetime"} portal access` },
                  { icon: GraduationCap, text: "SLMC exam preparation materials" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-ink">
                    <div className="w-6 h-6 rounded-lg bg-clinical-teal/10 border border-clinical-teal/15 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-clinical-teal" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
              {/* Syllabus header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-chart-grid bg-linen/40">
                <div>
                  <h2 className="text-base font-display font-semibold text-ink">
                    Syllabus &amp; Lesson Breakdown
                  </h2>
                  <p className="text-xs font-mono text-sage mt-0.5">
                    {course.chapters.length} Chapters · {lessonsCount} Video &amp; Document Lessons
                    {questionsCount > 0 && ` · ${questionsCount} Practice Questions`}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-chart-red bg-chart-red/8 border border-chart-red/20 px-3 py-1.5 rounded-full">
                  <Lock className="w-3 h-3" /> Enrolled Access Only
                </span>
              </div>

              {/* Chapter accordion rows */}
              <div className="divide-y divide-chart-grid/60">
                {course.chapters.map((chapter: any, idx: number) => {
                  const chQuestions = chapter.lessons.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                  const chLessons = chapter.lessons.length - chQuestions;

                  return (
                    <div key={chapter.id}>
                      {/* Chapter header */}
                      <div className="flex items-center gap-4 px-6 py-4 bg-linen/20 hover:bg-linen/40 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-clinical-teal text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold font-sans text-ink truncate">
                            {chapter.title}
                          </h3>
                          <p className="text-[10px] font-mono text-sage mt-0.5">
                            {chLessons > 0 ? `${chLessons} lesson${chLessons > 1 ? "s" : ""}` : ""}
                            {chLessons > 0 && chQuestions > 0 ? " · " : ""}
                            {chQuestions > 0 ? `${chQuestions} question${chQuestions > 1 ? "s" : ""}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Lessons list */}
                      <ul className="divide-y divide-chart-grid/30">
                        {chapter.lessons.map((lesson: any) => {
                          const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                          const isDocument = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                          const isPptx = lesson.title?.toLowerCase().includes("pptx") || lesson.driveFileId?.toLowerCase().includes("pptx");
                          const docLabel = isPptx ? "PPTX" : "PDF";

                          return (
                            <li key={lesson.id} className="flex items-center justify-between px-6 py-3 hover:bg-linen/10 transition-colors group">
                              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                  isQuiz ? "bg-purple-50 border border-purple-200" :
                                  isDocument ? "bg-amber-50 border border-amber-200" :
                                  "bg-clinical-teal/8 border border-clinical-teal/15"
                                }`}>
                                  {isQuiz ? (
                                    <HelpCircle className="w-3 h-3 text-purple-600" />
                                  ) : isDocument ? (
                                    <FileText className="w-3 h-3 text-amber-600" />
                                  ) : (
                                    <Video className="w-3 h-3 text-clinical-teal" />
                                  )}
                                </div>
                                <span className="text-xs text-ink-muted truncate group-hover:text-ink transition-colors">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="shrink-0 ml-3">
                                {isQuiz ? (
                                  <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                    Practice Q
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-sage flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    {isDocument ? docLabel : "Video"}
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructors */}
            {displayInstructors.length > 0 && (
              <div className="bg-white border border-chart-grid rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div>
                  <h2 className="text-xs font-mono uppercase tracking-widest text-sage font-bold">
                    Course Instructors
                  </h2>
                  <p className="text-[11px] font-mono text-sage/70 mt-0.5">Senior faculty leading this program</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayInstructors.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-4 border border-chart-grid rounded-xl bg-linen/20 hover:border-clinical-teal/30 hover:bg-clinical-teal/3 transition-all group">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-chart-grid group-hover:border-clinical-teal/40 transition-colors shrink-0">
                        <Image src={f.photoUrl || "/lecturer.jpeg"} alt={f.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-ink font-sans truncate">{f.name}</h4>
                        <p className="text-[11px] font-mono text-clinical-teal truncate">{f.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COL: Sticky enrollment card ── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">

              {/* Main enrollment card */}
              <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-lg">
                {/* Cover image */}
                {coverSrc ? (
                  <div className="relative h-44 overflow-hidden">
                    <Image src={coverSrc} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
                    {/* Category badge over image */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-mono font-bold text-white bg-ink/70 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-full">
                        {courseCode}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-28 bg-gradient-to-br from-clinical-teal/15 to-chart-red/10 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-clinical-teal/30" />
                  </div>
                )}

                <div className="p-5 space-y-5">
                  {/* Price */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-sage">Total Course Fee</p>
                    <p className="text-3xl font-mono font-bold text-clinical-teal">{formatCurrency(course.price)}</p>
                    <p className="text-[11px] text-ink-muted">Lifetime portal access &amp; printable certification.</p>
                  </div>

                  {/* CTA */}
                  <div className="space-y-2">
                    <Link href={createCourseInquiryWALink(course.title)} target="_blank" rel="noopener noreferrer" className="block">
                      <button className="w-full flex items-center justify-center gap-2 bg-chart-red hover:bg-chart-red-hover text-white font-bold text-sm py-3 px-5 rounded-full transition-colors shadow-md shadow-chart-red/20">
                        <PhoneCall className="w-4 h-4" />
                        Inquire &amp; Enroll Now
                      </button>
                    </Link>
                    <Link href="/contact" className="block">
                      <button className="w-full flex items-center justify-center gap-2 border border-chart-grid text-ink-muted hover:border-clinical-teal/40 hover:text-clinical-teal font-medium text-xs py-2.5 px-5 rounded-full transition-colors bg-linen/30">
                        Send an inquiry form
                      </button>
                    </Link>
                    <p className="text-[10px] text-center text-sage font-mono pt-0.5">
                      Portal credentials delivered via WhatsApp
                    </p>
                  </div>

                  {/* Course specs */}
                  <div className="border-t border-chart-grid/60 pt-4 space-y-2.5">
                    {[
                      { icon: Clock, text: course.enrollmentValidity || "Lifetime Access", label: "Validity" },
                      { icon: Users, text: `${course.totalEnrolled || 450}+ Students`, label: "Enrolled" },
                      { icon: Layers, text: `${course.chapters.length} Chapters · ${lessonsCount} Lessons`, label: "Content" },
                    ].map(({ icon: Icon, text, label }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-ink-muted font-mono">
                          <Icon className="w-3.5 h-3.5 text-clinical-teal" />
                          {label}
                        </span>
                        <span className="font-semibold text-ink text-right">{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Feature checkmarks */}
                  <div className="space-y-1.5 pt-1">
                    {[
                      "Domain-locked HD video lectures",
                      "PDF lab guides & case studies",
                      "Official IMHS certificate",
                      "WhatsApp support access",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-[11px] text-ink-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp quick-contact card */}
              <div className="bg-clinical-teal/5 border border-clinical-teal/20 rounded-2xl p-4 space-y-2 text-center">
                <p className="text-xs font-mono text-sage uppercase tracking-wider">Have questions?</p>
                <Link href={createCourseInquiryWALink(course.title)} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-clinical-teal hover:text-clinical-teal-hover transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Chat with an advisor on WhatsApp
                  </button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

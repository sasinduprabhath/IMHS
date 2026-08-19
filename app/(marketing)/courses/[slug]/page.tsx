import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
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
  ShieldCheck,
} from "lucide-react";

export const revalidate = 60;

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  try {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) return { title: "Course Not Found | IMHS" };
    const coverUrl = course.coverImage
      ? course.coverImage.startsWith("http")
        ? course.coverImage
        : `https://imhsedu.com${course.coverImage}`
      : "https://imhsedu.com/gallery/imhs-campus.jpg";

    return {
      title: `${course.title} | IMHS Pharmacy Education`,
      description: course.description?.slice(0, 160) || "SLMC-aligned modern pharmacy course at IMHS.",
      alternates: {
        canonical: `https://imhsedu.com/courses/${slug}`,
      },
      openGraph: {
        title: `${course.title} | IMHS`,
        description: course.description?.slice(0, 160) || "SLMC-aligned modern pharmacy course at IMHS.",
        url: `https://imhsedu.com/courses/${slug}`,
        images: [{ url: coverUrl, width: 1200, height: 630, alt: course.title }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${course.title} | IMHS`,
        description: course.description?.slice(0, 160),
        images: [coverUrl],
      },
    };
  } catch {
    return { title: "Course Details | IMHS" };
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
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.facultyMember.findMany({ take: 4, orderBy: { order: "asc" } }),
    ]);
    course = cData;
    faculty = fData;
  } catch (error) {
    console.error("Course detail DB error:", error);
  }

  if (!course || !course.published) notFound();

  const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();
  const enrolledCount = course._count?.enrollments ?? course.totalEnrolled ?? 0;
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

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "EducationalOrganization",
      name: "Institute of Medicine and Health Sciences (IMHS)",
      sameAs: "https://imhsedu.com",
    },
    educationalLevel: course.level || "All Levels",
    courseCode: courseCode,
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: course.price || 0,
      priceCurrency: "LKR",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "blended",
      courseWorkload: course.enrollmentValidity || "Lifetime Access",
    },
  };

  return (
    <div className="min-h-screen bg-linen/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">

        {/* Inline back link - plain text, no bar */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-sage hover:text-clinical-teal transition-colors group mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ══ LEFT: POSTER IMAGE (sticky, tall) ═══════════════════════════ */}
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-24">
              {/* Poster card fitting natural image dimensions without overlays */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-chart-grid bg-white">
                {coverSrc ? (
                  <Image
                    src={coverSrc}
                    alt={course.title}
                    width={600}
                    height={800}
                    className="w-full h-auto object-contain rounded-2xl"
                    priority
                    unoptimized={coverSrc.startsWith("http")}
                  />
                ) : (
                  /* No-image fallback poster */
                  <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-ink via-clinical-teal/30 to-chart-red/20 flex flex-col items-center justify-center gap-4 p-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-mono font-bold text-clinical-teal uppercase tracking-widest">{courseCode}</p>
                      <p className="text-sm font-display font-semibold text-white text-center leading-snug">{course.title}</p>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">IMHS Accredited</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enrollment count badge below poster */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-mono text-sage">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-clinical-teal" />
                  {enrolledCount} Enrolled
                </span>
                <span className="text-chart-grid">·</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                  IMHS Accredited
                </span>
              </div>
            </div>
          </div>

          {/* ══ MIDDLE: Course info + Syllabus + Instructors ════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">

            {/* Course identity */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {courseCode}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sage border border-sage/25 bg-sage/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Award className="w-3 h-3" /> Accredited Certification
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-snug">
                {course.title}
              </h1>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Layers className="w-3.5 h-3.5 text-clinical-teal" />
                  {course.chapters.length} Chapters
                </span>
                <span className="text-chart-grid text-xs">·</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Video className="w-3.5 h-3.5 text-clinical-teal" />
                  {lessonsCount} Lessons
                </span>
                {questionsCount > 0 && (
                  <>
                    <span className="text-chart-grid text-xs">·</span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      {questionsCount} Practice Qs
                    </span>
                  </>
                )}
                <span className="text-chart-grid text-xs">·</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {course.enrollmentValidity || "Lifetime"} Access
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm space-y-2">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">About This Course</h2>
              <p className="text-sm text-ink-muted leading-relaxed font-sans">{course.description}</p>
            </div>

            {/* What's included (compact grid) */}
            <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold mb-3">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: Video, text: "HD video lectures (domain-locked)" },
                  { icon: FileText, text: "PDF lab guides & case studies" },
                  { icon: Award, text: "Official IMHS Completion Certificate" },
                  { icon: MessageCircle, text: "WhatsApp admin support" },
                  { icon: Clock, text: `${course.enrollmentValidity || "Lifetime"} portal access` },
                  { icon: GraduationCap, text: "SLMC exam preparation materials" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-chart-grid bg-linen/40">
                <div>
                  <h2 className="text-sm font-display font-semibold text-ink">Syllabus &amp; Lesson Breakdown</h2>
                  <p className="text-[10px] font-mono text-sage mt-0.5">
                    {course.chapters.length} Chapters · {lessonsCount} Lessons
                    {questionsCount > 0 && ` · ${questionsCount} Practice Qs`}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-chart-red bg-chart-red/8 border border-chart-red/20 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> Enrolled Only
                </span>
              </div>

              <div className="divide-y divide-chart-grid/50">
                {course.chapters.map((chapter: any, idx: number) => {
                  const chQ = chapter.lessons.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                  const chL = chapter.lessons.length - chQ;
                  return (
                    <div key={chapter.id}>
                      <div className="flex items-center gap-3 px-5 py-3 bg-linen/20">
                        <div className="w-6 h-6 rounded-lg bg-clinical-teal text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold font-sans text-ink truncate">{chapter.title}</h3>
                          <p className="text-[10px] font-mono text-sage">
                            {chL > 0 ? `${chL} lesson${chL > 1 ? "s" : ""}` : ""}
                            {chL > 0 && chQ > 0 ? " · " : ""}
                            {chQ > 0 ? `${chQ} question${chQ > 1 ? "s" : ""}` : ""}
                          </p>
                        </div>
                      </div>
                      <ul className="divide-y divide-chart-grid/25">
                        {chapter.lessons.map((lesson: any) => {
                          const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                          const isDoc = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                          const isPptx = lesson.title?.toLowerCase().includes("pptx");
                          return (
                            <li key={lesson.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-linen/10 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isQuiz ? "bg-purple-50 border border-purple-200" :
                                    isDoc ? "bg-amber-50 border border-amber-200" :
                                      "bg-clinical-teal/8 border border-clinical-teal/15"}`}>
                                  {isQuiz ? <HelpCircle className="w-2.5 h-2.5 text-purple-600" /> :
                                    isDoc ? <FileText className="w-2.5 h-2.5 text-amber-600" /> :
                                      <Video className="w-2.5 h-2.5 text-clinical-teal" />}
                                </div>
                                <span className="text-xs text-ink-muted truncate">{lesson.title}</span>
                              </div>
                              <span className="shrink-0 ml-2">
                                {isQuiz ? (
                                  <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">Q</span>
                                ) : (
                                  <span className="text-[9px] font-mono text-sage flex items-center gap-0.5">
                                    <Lock className="w-2 h-2" />
                                    {isDoc ? (isPptx ? "PPTX" : "PDF") : "Video"}
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
              <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm space-y-3">
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">Course Instructors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayInstructors.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 border border-chart-grid rounded-xl bg-linen/20 hover:border-clinical-teal/30 transition-all group">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-chart-grid group-hover:border-clinical-teal/40 transition-colors shrink-0">
                        <Image
                          src={f.photoUrl || "/lecturer.jpeg"}
                          alt={f.name}
                          fill
                          className="object-cover"
                          unoptimized={!!f.photoUrl?.startsWith("http")}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-ink truncate">{f.name}</h4>
                        <p className="text-[10px] font-mono text-clinical-teal truncate">{f.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT: Sticky enrollment card ══════════════════════════════ */}
          <div className="lg:col-span-3 xl:col-span-3">
            <div className="sticky top-32 space-y-4">

              {/* Enrollment card */}
              <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-xl">
                {/* Teal-red accent stripe at top */}
                <div className="h-1.5 bg-gradient-to-r from-clinical-teal via-clinical-teal to-chart-red" />

                <div className="p-5 space-y-5">
                  {/* Price block */}
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-sage">Total Course Fee</p>
                    <p className="text-3xl font-mono font-bold text-clinical-teal">{formatCurrency(course.price)}</p>
                    <p className="text-[10px] text-ink-muted">Lifetime portal access &amp; certification</p>
                  </div>

                  {/* Primary CTA */}
                  <div className="space-y-2">
                    <Link href={createCourseInquiryWALink(course.title)} target="_blank" rel="noopener noreferrer" className="block">
                      <button className="w-full flex items-center justify-center gap-2 bg-chart-red hover:bg-chart-red-hover text-white font-bold text-sm py-3 px-5 rounded-full transition-all shadow-lg shadow-chart-red/20 hover:shadow-chart-red/30 hover:-translate-y-px">
                        <PhoneCall className="w-4 h-4" />
                        Inquire &amp; Enroll Now
                      </button>
                    </Link>
                    <Link href="/contact" className="block">
                      <button className="w-full flex items-center justify-center gap-2 border border-chart-grid text-ink-muted hover:border-clinical-teal/50 hover:text-clinical-teal text-xs py-2.5 px-5 rounded-full transition-colors bg-linen/30">
                        Send an inquiry form
                      </button>
                    </Link>
                    <p className="text-[9px] text-center text-sage font-mono">
                      Credentials delivered via WhatsApp
                    </p>
                  </div>

                  {/* Spec rows */}
                  <div className="border-t border-chart-grid/50 pt-4 space-y-2.5">
                    {[
                      { icon: Clock, label: "Validity", value: course.enrollmentValidity || "Lifetime" },
                      { icon: Users, label: "Enrolled", value: `${enrolledCount} Students` },
                      { icon: Layers, label: "Content", value: `${course.chapters.length} Ch · ${lessonsCount} Lessons` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted">
                          <Icon className="w-3.5 h-3.5 text-clinical-teal" /> {label}
                        </span>
                        <span className="text-[11px] font-semibold text-ink">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Checkmarks */}
                  <div className="space-y-1.5 border-t border-chart-grid/50 pt-3">
                    {[
                      "HD video lectures",
                      "PDF lab guides & cases",
                      "IMHS completion certificate",
                      "WhatsApp support",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-[11px] text-ink-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp nudge */}
              <div className="bg-clinical-teal/5 border border-clinical-teal/20 rounded-xl p-3 text-center">
                <p className="text-[10px] font-mono text-sage uppercase tracking-wider mb-1.5">Have questions?</p>
                <Link href={createCourseInquiryWALink(course.title)} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-clinical-teal hover:text-clinical-teal-hover transition-colors py-1">
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
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

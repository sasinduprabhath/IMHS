import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { FormattedText } from "@/components/ui/formatted-text";
import {
  BookOpen,
  PhoneCall,
  CheckCircle2,
  Lock,
  FileText,
  Video,
  Award,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Users,
  HelpCircle,
} from "lucide-react";

export const revalidate = 60;

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
    });
    if (!course) return { title: "Course Not Found - IMHS" };
    return {
      title: `${course.title} - IMHS`,
      description: course.description,
    };
  } catch (error) {
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
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
          announcements: {
            orderBy: { createdAt: "desc" },
          },
          instructors: {
            include: {
              facultyMember: true,
            },
          },
        },
      }),
      prisma.facultyMember.findMany({
        take: 4,
        orderBy: { order: "asc" },
      }),
    ]);
    course = cData;
    faculty = fData;
  } catch (error) {
    console.error("Course detail DB connection error (MySQL):", error);
  }

  if (!course || !course.published) {
    notFound();
  }

  const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();
  const totalLessons = course.chapters.reduce((acc: number, ch: any) => acc + ch.lessons.length, 0);

  return (
    <div className="space-y-12 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link href="/courses" className="inline-flex items-center gap-2 text-xs font-mono text-ink-muted hover:text-clinical-teal">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>
      </div>

      {/* Main Grid: Info + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 8 Cols: Main Description & Syllabus */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold bg-clinical-teal-surface text-clinical-teal px-2.5 py-1 rounded">
                {courseCode}
              </span>
              <span className="font-mono text-xs text-sage uppercase">
                ACCREDITED CLINICAL CERTIFICATION
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink leading-tight">
              {course.title}
            </h1>

            <p className="text-base text-ink-muted leading-relaxed font-sans">
              {course.description}
            </p>
          </div>

          <VitalLine variant="hero" animated={false} />

          {/* Syllabus Outline (No Video Player - Anti-Piracy Boundary) */}
          <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6">
            <div className="flex items-center justify-between border-b border-chart-grid pb-4">
              <div>
                <h2 className="text-xl font-display font-semibold text-ink">
                  Syllabus & Lesson Breakdown
                </h2>
                {(() => {
                  const allLessons = course.chapters.flatMap((ch: any) => ch.lessons);
                  const questionsCount = allLessons.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                  const lessonsCount = allLessons.length - questionsCount;

                  return (
                    <p className="text-xs font-mono text-sage mt-0.5">
                      {course.chapters.length} Chapters • {lessonsCount} Video & Document Lessons
                      {questionsCount > 0 && ` • ${questionsCount} Practice Questions`}
                    </p>
                  );
                })()}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-chart-red bg-chart-red/10 border border-chart-red/20 px-3 py-1 rounded">
                <Lock className="w-3.5 h-3.5" /> Enrolled Access Only
              </div>
            </div>

            <div className="space-y-6">
              {course.chapters.map((chapter: any) => {
                const chQuestions = chapter.lessons.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                const chLessons = chapter.lessons.length - chQuestions;

                return (
                  <div key={chapter.id} className="border border-chart-grid/80 rounded p-4 bg-linen/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold font-mono text-ink">
                        {chapter.title}
                      </h3>
                      <span className="text-[11px] font-mono text-sage">
                        {chLessons > 0 ? `${chLessons} Lessons` : ""}{chQuestions > 0 ? ` ${chQuestions} Questions` : ""}
                      </span>
                    </div>

                    <ul className="space-y-2 pt-1 border-t border-chart-grid/50">
                      {chapter.lessons.map((lesson: any) => {
                        const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                        const isDocument = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                        const isPptx = lesson.title?.toLowerCase().includes("pptx") || lesson.driveFileId?.toLowerCase().includes("pptx");
                        const docLabel = isPptx ? "PPTX" : "PDF";

                        return (
                          <li key={lesson.id} className="flex items-center justify-between text-xs text-ink-muted pl-2 py-1">
                            <div className="flex items-center gap-2 overflow-hidden">
                              {isQuiz ? (
                                <HelpCircle className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              ) : isDocument ? (
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              ) : (
                                <Video className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            
                            <span className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                              {isQuiz ? (
                                <span className="text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3" /> Practice Question
                                </span>
                              ) : (
                                <span className="text-sage">
                                  <Lock className="w-3 h-3 inline mr-1" /> {isDocument ? `Locked ${docLabel}` : "Locked Video"}
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

          {/* Instructor Bios */}
          <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-4 shadow-paper">
            <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
              <Award className="w-5 h-5 text-clinical-teal" /> Course Instructors
            </h2>
            {(() => {
              const displayInstructors =
                course.instructors && course.instructors.length > 0
                  ? course.instructors.map((i: any) => i.facultyMember)
                  : faculty;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {displayInstructors.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 border border-chart-grid rounded bg-linen/30">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border border-chart-grid shrink-0">
                        <Image src={f.photoUrl || "/lecturer.jpeg"} alt={f.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-ink font-sans">{f.name}</h4>
                        <p className="text-[11px] font-mono text-clinical-teal">{f.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right 4 Cols: Sticky Purchase/Enrollment Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-surface border border-chart-grid p-6 rounded-card space-y-6 shadow-paper-stack">
            {course.coverImage && (
              <div className="relative h-44 rounded overflow-hidden border border-chart-grid">
                <Image src={formatGoogleDriveImageUrl(course.coverImage) || course.coverImage} alt={course.title} fill className="object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-sage">Total Course Fee</span>
              <div className="text-3xl font-mono font-bold text-clinical-teal">
                {formatCurrency(course.price)}
              </div>
              <p className="text-[11px] text-ink-muted">Includes lifetime portal access & printable certification.</p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/contact"
                className="block w-full"
              >
                <Button variant="danger" size="lg" className="w-full gap-2 font-semibold">
                  <PhoneCall className="w-5 h-5" />
                  Inquire & Enroll Now
                </Button>
              </Link>
              <p className="text-[11px] text-center text-ink-muted font-mono">
                Submit an inquiry to receive your student portal credentials.
              </p>
            </div>

            <div className="border-t border-chart-grid pt-4 space-y-2.5 text-xs text-ink font-sans">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Validity: <strong>{course.enrollmentValidity || "Lifetime Access"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-clinical-teal shrink-0" />
                <span>Total Enrolled: <strong>{course.totalEnrolled || 450}+ Students</strong></span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0" />
                <span>Domain-locked HD video lectures</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0" />
                <span>PDF lab reference guides & case studies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0" />
                <span>Official IMHS Completion Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0" />
                <span>WhatsApp administrator support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Stethoscope,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Download,
} from "lucide-react";

const SESSIONS = [
  {
    id: "ACADEMIC_MENTORSHIP",
    title: "Academic & SLMC Exam Mentorship",
    duration: "30 Mins",
    durationMins: 30,
    icon: GraduationCap,
    tag: "Exam Prep & Strategy",
    color: "text-clinical-teal border-clinical-teal/30 bg-clinical-teal/5",
    description:
      "1-on-1 guidance on SLMC Pharmacy exam prep, subject priority, SEQ writing techniques, and study schedules.",
  },
  {
    id: "CLINICAL_CONSULTATION",
    title: "Clinical & Hospital Career Guidance",
    duration: "45 Mins",
    durationMins: 45,
    icon: Stethoscope,
    tag: "Hospital & Career Pathways",
    color: "text-chart-blue border-chart-blue/30 bg-chart-blue/5",
    description:
      "Direct consultation on clinical pharmacy practice, hospital internships, overseas registration, and career opportunities.",
  },
  {
    id: "MOCK_INTERVIEW",
    title: "Mock Viva & Interview Coaching",
    duration: "60 Mins",
    durationMins: 60,
    icon: MessageSquare,
    tag: "1-on-1 Oral Practice",
    color: "text-chart-orange border-chart-orange/30 bg-chart-orange/5",
    description:
      "Comprehensive viva voce simulation, real-time feedback, and hospital job interview practice with Dr. Isuru.",
  },
];

const TIME_SLOTS = [
  "09:30 AM",
  "11:00 AM",
  "02:00 PM",
  "04:30 PM",
  "06:30 PM",
];

export function DrIsuruBookingClient() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedSession, setSelectedSession] = useState(SESSIONS[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [topicNotes, setTopicNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Generate available dates (next 14 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) {
        // Skip Sundays
        dates.push({
          isoString: d.toISOString().split("T")[0],
          dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
          dayNumber: d.getDate(),
          monthName: d.toLocaleDateString("en-US", { month: "short" }),
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleNextStep = () => {
    setErrorMsg("");
    if (step === 1 && !selectedSession) {
      setErrorMsg("Please select a mentorship session type.");
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTimeSlot)) {
      setErrorMsg("Please choose both a date and an available time slot.");
      return;
    }
    setStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!studentName || !studentEmail || !studentPhone) {
      setErrorMsg("Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/consultations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentEmail,
          studentPhone,
          sessionType: selectedSession.id,
          durationMins: selectedSession.durationMins,
          bookingDate: selectedDate,
          timeSlot: selectedTimeSlot,
          topicNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking.");
      }

      setConfirmedBooking(data.booking);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="booking-widget" className="max-w-4xl mx-auto bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
      {/* Header Bar */}
      <div className="bg-linen/60 border-b border-chart-grid p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 px-2.5 py-1 rounded-full">
            1-ON-1 APPOINTMENT SYSTEM
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink mt-2">
            Book Mentorship with Dr. Isuru Wijesinghe
          </h2>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                step === s
                  ? "bg-clinical-teal text-white scale-110 shadow-sm"
                  : step > s
                  ? "bg-clinical-teal/20 text-clinical-teal"
                  : "bg-surface text-ink-muted border border-chart-grid"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-6">
        {errorMsg && (
          <div className="bg-chart-red/10 border border-chart-red/30 text-chart-red p-4 rounded-card text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT SESSION TYPE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-display font-bold text-ink">
                  Step 1: Choose Your Mentorship &amp; Consultation Session
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Select the specialized guidance format that best matches your academic or career goal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SESSIONS.map((session) => {
                  const isSelected = selectedSession.id === session.id;
                  const Icon = session.icon;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-6 rounded-card border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "border-clinical-teal bg-clinical-teal/5 shadow-paper-stack ring-2 ring-clinical-teal/20"
                          : "border-chart-grid bg-surface hover:border-clinical-teal/40 hover:bg-linen/30"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-card border ${session.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-sage bg-linen border border-chart-grid px-2.5 py-1 rounded-full">
                            {session.duration}
                          </span>
                        </div>

                        <h4 className="text-base font-bold font-sans text-ink leading-snug">
                          {session.title}
                        </h4>

                        <p className="text-xs text-ink-muted leading-relaxed">
                          {session.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-chart-grid/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-clinical-teal font-semibold">
                          {session.tag}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-clinical-teal" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNextStep} className="gap-2 font-mono text-xs">
                  Continue to Date &amp; Time <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DATE & TIME SLOT SELECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-display font-bold text-ink">
                  Step 2: Select Consultation Date &amp; Time Slot
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Dr. Isuru conducts 1-on-1 online sessions Monday through Saturday.
                </p>
              </div>

              {/* Date Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-ink flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-clinical-teal" /> Select Preferred Date:
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.map((d) => {
                    const isSelected = selectedDate === d.isoString;
                    return (
                      <button
                        key={d.isoString}
                        type="button"
                        onClick={() => setSelectedDate(d.isoString)}
                        className={`shrink-0 w-20 py-3 px-2 rounded-card border text-center transition-all ${
                          isSelected
                            ? "bg-clinical-teal text-white border-clinical-teal shadow-md scale-105"
                            : "bg-surface text-ink border-chart-grid hover:border-clinical-teal/40 hover:bg-linen/50"
                        }`}
                      >
                        <span className="block text-[10px] font-mono uppercase opacity-80">
                          {d.dayName}
                        </span>
                        <span className="block text-xl font-bold font-display my-0.5">
                          {d.dayNumber}
                        </span>
                        <span className="block text-[10px] font-mono opacity-80">
                          {d.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selector */}
              {selectedDate && (
                <div className="space-y-3 pt-4 border-t border-chart-grid">
                  <label className="text-xs font-mono font-bold uppercase text-ink flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-clinical-teal" /> Select Time Slot (Sri Lanka Time GMT+5:30):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-3 px-3 rounded-card border text-xs font-mono font-bold transition-all text-center ${
                            isSelected
                              ? "bg-clinical-teal text-white border-clinical-teal shadow-sm scale-105"
                              : "bg-surface text-ink border-chart-grid hover:border-clinical-teal/40 hover:bg-linen/50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-chart-grid flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevStep} className="gap-2 font-mono text-xs">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="gap-2 font-mono text-xs"
                >
                  Enter Student Details <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: STUDENT DETAILS FORM */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-display font-bold text-ink">
                  Step 3: Enter Your Contact Details &amp; Session Goal
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Dr. Isuru will review your notes prior to the session to customize his guidance.
                </p>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-clinical-teal" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-white border border-chart-grid rounded-card px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-clinical-teal" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kasun@gmail.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full bg-white border border-chart-grid rounded-card px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-clinical-teal" /> WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full bg-white border border-chart-grid rounded-card px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-clinical-teal" /> Topic / Questions for Dr. Isuru (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you'd like to focus on during this 1-on-1 session..."
                    value={topicNotes}
                    onChange={(e) => setTopicNotes(e.target.value)}
                    className="w-full bg-white border border-chart-grid rounded-card px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                  />
                </div>

                {/* Session Summary Card */}
                <div className="bg-linen/60 border border-chart-grid p-4 rounded-card space-y-1.5 text-xs font-mono">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>Selected Session: {selectedSession.title}</span>
                    <span className="text-clinical-teal">{selectedSession.duration}</span>
                  </div>
                  <div className="text-ink-muted">
                    Scheduled For: {selectedDate} at {selectedTimeSlot} (GMT+5:30)
                  </div>
                </div>

                <div className="pt-4 border-t border-chart-grid flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevStep} className="gap-2 font-mono text-xs">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2 font-mono text-xs">
                    {loading ? "Submitting Booking..." : "Confirm & Submit Booking"} <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION VIEW */}
          {step === 4 && confirmedBooking && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-6"
            >
              <div className="w-16 h-16 bg-clinical-teal/10 text-clinical-teal rounded-full flex items-center justify-center mx-auto border border-clinical-teal/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-clinical-teal bg-clinical-teal/10 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> BOOKING REQUEST RECEIVED
                </span>
                <h3 className="text-2xl font-display font-bold text-ink">
                  Your Appointment Request is Submitted!
                </h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-ink">{confirmedBooking.studentName}</strong>. Your 1-on-1 mentorship session with Dr. Isuru Wijesinghe has been logged.
                </p>
              </div>

              <div className="bg-linen/50 border border-chart-grid p-6 rounded-card max-w-md mx-auto text-left space-y-3 text-xs font-mono text-ink">
                <div className="flex items-center justify-between border-b border-chart-grid pb-2.5">
                  <span className="text-ink-muted uppercase">Reference Code:</span>
                  <span className="font-bold text-clinical-teal text-sm">{confirmedBooking.bookingCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Session:</span>
                  <span className="font-semibold">{selectedSession.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Date &amp; Time:</span>
                  <span className="font-semibold">{selectedDate} @ {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex items-center justify-between border-t border-chart-grid pt-2">
                  <span className="text-ink-muted">Status:</span>
                  <span className="font-bold text-chart-orange bg-chart-orange/10 px-2.5 py-0.5 rounded-full">
                    Pending Admin Approval
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                IMHS Administration will confirm your session time and email/WhatsApp you the Google Meet video link shortly.
              </p>

              <div className="pt-2 flex justify-center">
                <Button
                  onClick={() => {
                    setStep(1);
                    setConfirmedBooking(null);
                  }}
                  variant="outline"
                  className="rounded-full text-xs font-mono gap-2"
                >
                  <Sparkles className="w-4 h-4 text-clinical-teal" /> Book Another Session
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

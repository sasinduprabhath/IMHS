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
} from "lucide-react";

const SESSIONS = [
  {
    id: "STUDY_PLANNING_GUIDANCE",
    number: 1,
    title: "Study Planning and Academic Guidance",
    duration: "30 Minutes",
    durationMins: 30,
    priceLkr: 3500,
    priceFormatted: "LKR 3,500",
    icon: GraduationCap,
    category: "Examination Planning",
    tag: "Examination Planning",
    color: "text-clinical-teal border-clinical-teal/30 bg-clinical-teal/5",
    description:
      "Personalised guidance on subject priorities, study schedules, revision methods, and preparation based on your current level.",
  },
  {
    id: "MCQ_SEQ_STRATEGIES",
    number: 2,
    title: "MCQ and SEQ Answering Strategies",
    duration: "45 Minutes",
    durationMins: 45,
    priceLkr: 5000,
    priceFormatted: "LKR 5,000",
    icon: Stethoscope,
    category: "Written Examination Preparation",
    tag: "Written Examination Preparation",
    color: "text-chart-blue border-chart-blue/30 bg-chart-blue/5",
    description:
      "Focused guidance on answering MCQs and SEQs, managing examination time, identifying key points, and improving answer structure.",
  },
  {
    id: "MOCK_VIVA_OSPE_COACHING",
    number: 3,
    title: "Mock Viva and OSPE Coaching",
    duration: "60 Minutes",
    durationMins: 60,
    priceLkr: 7500,
    priceFormatted: "LKR 7,500",
    icon: MessageSquare,
    category: "Practical and Oral Examination Preparation",
    tag: "Practical and Oral Examination Preparation",
    color: "text-chart-orange border-chart-orange/30 bg-chart-orange/5",
    description:
      "Individual mock viva and OSPE practice with examination-style questions, practical scenarios, immediate feedback, and correction of weaknesses.",
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [topicNotes, setTopicNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Fetch booked slots whenever selectedDate changes
  React.useEffect(() => {
    if (selectedDate) {
      setFetchingAvailability(true);
      fetch(`/api/consultations/availability?date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          const booked = data.bookedSlots || [];
          setBookedSlots(booked);
          if (booked.includes(selectedTimeSlot)) {
            setSelectedTimeSlot("");
          }
        })
        .catch((err) => console.error("Availability error:", err))
        .finally(() => setFetchingAvailability(false));
    }
  }, [selectedDate]);

  // Generate available dates (next 14 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) {
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
          priceLkr: selectedSession.priceLkr,
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
    <div id="booking-widget" className="max-w-4xl mx-auto bg-surface border border-chart-grid rounded-2xl shadow-paper overflow-hidden">
      {/* Header Bar */}
      <div className="bg-linen/60 border-b border-chart-grid p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 px-2.5 py-1 rounded-full inline-block">
            ONE-TO-ONE APPOINTMENT SYSTEM
          </span>
          <h2 className="text-lg sm:text-2xl font-display font-bold text-ink leading-snug">
            Book an Examination Mentorship Session with Dr. Isuru Wijesinghe
          </h2>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono shrink-0">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                step === s
                  ? "bg-clinical-teal text-white scale-105 shadow-sm"
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

      <div className="p-4 sm:p-8 md:p-10 space-y-6">
        {errorMsg && (
          <div className="bg-chart-red/10 border border-chart-red/30 text-chart-red p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 font-medium">
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
                <h3 className="text-sm sm:text-base font-display font-bold text-ink">
                  Step 1: Select Your Mentorship Session
                </h3>
                <p className="text-xs text-ink-muted mt-1 font-sans">
                  Choose the support you need for your External Pharmacist Examination preparation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {SESSIONS.map((session) => {
                  const isSelected = selectedSession.id === session.id;
                  const Icon = session.icon;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 sm:p-6 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "border-clinical-teal bg-clinical-teal/5 shadow-paper-stack ring-2 ring-clinical-teal/20"
                          : "border-chart-grid bg-surface hover:border-clinical-teal/40 hover:bg-linen/30"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 ${session.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold justify-end">
                            <span className="text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap">
                              {session.priceFormatted}
                            </span>
                            <span className="text-sage bg-linen border border-chart-grid px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap">
                              {session.duration}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold font-sans text-ink leading-snug">
                          {session.number}. {session.title}
                        </h4>

                        <p className="text-xs text-ink-muted leading-relaxed font-sans">
                          {session.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-chart-grid/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-clinical-teal font-semibold text-[10px] sm:text-[11px] leading-tight">
                          Category: {session.category}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-chart-grid flex justify-end">
                <Button onClick={handleNextStep} className="w-full sm:w-auto gap-2 font-mono text-xs py-3">
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
                <h3 className="text-sm sm:text-base font-display font-bold text-ink">
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
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
                  {availableDates.map((d) => {
                    const isSelected = selectedDate === d.isoString;
                    return (
                      <button
                        key={d.isoString}
                        type="button"
                        onClick={() => setSelectedDate(d.isoString)}
                        className={`snap-start shrink-0 w-16 sm:w-20 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-clinical-teal text-white border-clinical-teal shadow-md scale-105"
                            : "bg-surface text-ink border-chart-grid hover:border-clinical-teal/40 hover:bg-linen/50"
                        }`}
                      >
                        <span className="block text-[9px] sm:text-[10px] font-mono uppercase opacity-80">
                          {d.dayName}
                        </span>
                        <span className="block text-lg sm:text-xl font-bold font-display my-0.5">
                          {d.dayNumber}
                        </span>
                        <span className="block text-[9px] sm:text-[10px] font-mono opacity-80">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-mono font-bold uppercase text-ink flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-clinical-teal" /> Select Time Slot (Sri Lanka Time GMT+5:30):
                    </label>
                    {fetchingAvailability && (
                      <span className="text-[10px] font-mono text-clinical-teal animate-pulse">
                        Checking slot availability...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border text-xs font-mono font-bold transition-all text-center relative flex flex-col items-center justify-center gap-1 ${
                            isBooked
                              ? "bg-chart-red/5 border-chart-red/30 text-chart-red/60 cursor-not-allowed opacity-75"
                              : isSelected
                              ? "bg-clinical-teal text-white border-clinical-teal shadow-sm scale-105"
                              : "bg-surface text-ink border-chart-grid hover:border-clinical-teal/40 hover:bg-linen/50"
                          }`}
                        >
                          <span>{slot}</span>
                          <span
                            className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                              isBooked
                                ? "bg-chart-red/10 text-chart-red border border-chart-red/30"
                                : isSelected
                                ? "bg-white/20 text-white"
                                : "bg-clinical-teal/10 text-clinical-teal"
                            }`}
                          >
                            {isBooked ? "🔒 Booked" : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 sm:pt-6 border-t border-chart-grid flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button variant="outline" onClick={handlePrevStep} className="w-full sm:w-auto gap-2 font-mono text-xs">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="w-full sm:w-auto gap-2 font-mono text-xs"
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
                <h3 className="text-sm sm:text-base font-display font-bold text-ink">
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
                      className="w-full bg-white border border-chart-grid rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
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
                      className="w-full bg-white border border-chart-grid rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
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
                    className="w-full bg-white border border-chart-grid rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
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
                    className="w-full bg-white border border-chart-grid rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                  />
                </div>

                {/* Session Summary Card */}
                <div className="bg-linen/60 border border-chart-grid p-3.5 sm:p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div className="font-bold text-ink flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="break-words">Selected Session: {selectedSession.title}</span>
                    <span className="text-clinical-teal shrink-0">{selectedSession.duration}</span>
                  </div>
                  <div className="text-ink-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-chart-grid/40">
                    <span className="break-words">Scheduled: {selectedDate} at {selectedTimeSlot} (GMT+5:30)</span>
                    <span className="font-bold text-clinical-teal bg-clinical-teal/10 px-2 py-0.5 rounded self-start sm:self-auto shrink-0">
                      Fee: {selectedSession.priceFormatted}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-chart-grid flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={handlePrevStep} className="w-full sm:w-auto gap-2 font-mono text-xs">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2 font-mono text-xs">
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
              className="text-center space-y-6 py-4 sm:py-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-clinical-teal/10 text-clinical-teal rounded-full flex items-center justify-center mx-auto border border-clinical-teal/30">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold text-clinical-teal bg-clinical-teal/10 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> BOOKING REQUEST RECEIVED
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
                  Your Appointment Request is Submitted!
                </h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed px-2">
                  Thank you, <strong className="text-ink">{confirmedBooking.studentName}</strong>. Your 1-on-1 mentorship session with Dr. Isuru Wijesinghe has been logged.
                </p>
              </div>

              <div className="bg-linen/50 border border-chart-grid p-4 sm:p-6 rounded-xl max-w-md mx-auto text-left space-y-3 text-xs font-mono text-ink">
                <div className="flex items-center justify-between border-b border-chart-grid pb-2.5">
                  <span className="text-ink-muted uppercase">Reference Code:</span>
                  <span className="font-bold text-clinical-teal text-sm">{confirmedBooking.bookingCode}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-ink-muted">Session:</span>
                  <span className="font-semibold break-words">{selectedSession.title}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-ink-muted">Date &amp; Time:</span>
                  <span className="font-semibold">{selectedDate} @ {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex items-center justify-between border-t border-chart-grid pt-2">
                  <span className="text-ink-muted">Session Fee:</span>
                  <span className="font-bold text-clinical-teal bg-clinical-teal/10 px-2.5 py-0.5 rounded">
                    {selectedSession.priceFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-chart-grid pt-2">
                  <span className="text-ink-muted">Status:</span>
                  <span className="font-bold text-chart-orange bg-chart-orange/10 px-2.5 py-0.5 rounded-full">
                    Pending Admin Approval
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed px-2">
                IMHS Administration will confirm your session time and email/WhatsApp you the Google Meet video link shortly.
              </p>

              <div className="pt-2 flex justify-center">
                <Button
                  onClick={() => {
                    setStep(1);
                    setConfirmedBooking(null);
                  }}
                  variant="outline"
                  className="rounded-full text-xs font-mono gap-2 w-full sm:w-auto"
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

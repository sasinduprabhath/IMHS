import { RushRound } from "@/types/pharmacology";

export const AMLODIPINE_RUSH_ROUNDS: RushRound[] = [
  {
    roundNumber: 1,
    topic: "drugClass",
    topicLabel: "Round 01 — Drug Class",
    question: "Amlodipine belongs to which pharmacological class?",
    options: [
      { id: "a", text: "ACE inhibitor", isCorrect: false },
      { id: "b", text: "Calcium channel blocker", isCorrect: true },
      { id: "c", text: "Beta blocker", isCorrect: false },
      { id: "d", text: "Angiotensin receptor blocker (ARB)", isCorrect: false }
    ],
    explanation: "Amlodipine is a long-acting dihydropyridine calcium channel blocker (CCB)."
  },
  {
    roundNumber: 2,
    topic: "mainIndication",
    topicLabel: "Round 02 — Main Indication",
    question: "What is the primary clinical indication for Amlodipine?",
    options: [
      { id: "a", text: "Hypertension", isCorrect: true },
      { id: "b", text: "Bronchial Asthma", isCorrect: false },
      { id: "c", text: "Type 2 Diabetes Mellitus", isCorrect: false },
      { id: "d", text: "Acute Bacterial Infection", isCorrect: false }
    ],
    explanation: "Amlodipine is widely indicated for essential hypertension and chronic stable angina."
  },
  {
    roundNumber: 3,
    topic: "mechanismOfAction",
    topicLabel: "Round 03 — Mechanism",
    question: "What is the primary mechanism of action of Amlodipine?",
    options: [
      { id: "a", text: "Blocks L-type calcium channels in vascular smooth muscle", isCorrect: true },
      { id: "b", text: "Inhibits Angiotensin Converting Enzyme (ACE)", isCorrect: false },
      { id: "c", text: "Stimulates Beta-2 adrenergic receptors", isCorrect: false },
      { id: "d", text: "Blocks Histamine H2 receptors in stomach", isCorrect: false }
    ],
    explanation: "It inhibits transmembrane calcium influx into arterial smooth muscle cells, inducing vasodilation."
  },
  {
    roundNumber: 4,
    topic: "availableStrength",
    topicLabel: "Round 04 — Strength",
    question: "Which is a standard common oral tablet strength for Amlodipine?",
    options: [
      { id: "a", text: "5 mg", isCorrect: true },
      { id: "b", text: "50 mg", isCorrect: false },
      { id: "c", text: "500 mg", isCorrect: false },
      { id: "d", text: "1 g (1000 mg)", isCorrect: false }
    ],
    explanation: "Standard oral daily strengths for Amlodipine are 2.5 mg, 5 mg, and 10 mg."
  },
  {
    roundNumber: 5,
    topic: "dosageForm",
    topicLabel: "Round 05 — Dosage Form",
    question: "What is the most common oral dosage form for Amlodipine?",
    options: [
      { id: "a", text: "Oral Tablet", isCorrect: true },
      { id: "b", text: "Inhaler", isCorrect: false },
      { id: "c", text: "Eye Drop", isCorrect: false },
      { id: "d", text: "Rectal Suppository", isCorrect: false }
    ],
    explanation: "Amlodipine is primarily formulated as oral uncoated or film-coated tablets."
  },
  {
    roundNumber: 6,
    topic: "administration",
    topicLabel: "Round 06 — Administration",
    question: "How is Amlodipine usually administered?",
    options: [
      { id: "a", text: "Once daily", isCorrect: true },
      { id: "b", text: "Every hour", isCorrect: false },
      { id: "c", text: "Once weekly", isCorrect: false },
      { id: "d", text: "Only when acute blood pressure spikes occur", isCorrect: false }
    ],
    explanation: "Amlodipine has a long elimination half-life (~30–50 hours), enabling convenient once-daily dosing."
  },
  {
    roundNumber: 7,
    topic: "commonSideEffect",
    topicLabel: "Round 07 — Side Effect",
    question: "Which is a classic, well-documented side effect of Amlodipine therapy?",
    options: [
      { id: "a", text: "Ankle oedema (lower leg swelling)", isCorrect: true },
      { id: "b", text: "Severe Hypoglycaemia", isCorrect: false },
      { id: "c", text: "Persistent dry cough", isCorrect: false },
      { id: "d", text: "Oral thrush", isCorrect: false }
    ],
    explanation: "Precapillary arteriolar vasodilation leads to dependent fluid accumulation in ankles and feet."
  },
  {
    roundNumber: 8,
    topic: "precaution",
    topicLabel: "Round 08 — Precaution",
    question: "What key clinical parameter should be routinely monitored in patients taking Amlodipine?",
    options: [
      { id: "a", text: "Blood pressure & pulse rate", isCorrect: true },
      { id: "b", text: "Hearing acuity only", isCorrect: false },
      { id: "c", text: "Blood group antibodies", isCorrect: false },
      { id: "d", text: "Visual acuity only", isCorrect: false }
    ],
    explanation: "Regular blood pressure and heart rate monitoring ensures efficacy and prevents symptomatic hypotension."
  },
  {
    roundNumber: 9,
    topic: "counsellingPoint",
    topicLabel: "Round 09 — Counselling",
    question: "Which is the most appropriate patient counselling advice for Amlodipine?",
    options: [
      { id: "a", text: "Take regularly every day as prescribed", isCorrect: true },
      { id: "b", text: "Stop taking immediately when blood pressure feels normal", isCorrect: false },
      { id: "c", text: "Double the next dose if a daily dose is missed", isCorrect: false },
      { id: "d", text: "Take only when blood pressure feels high", isCorrect: false }
    ],
    explanation: "Antihypertensive therapy requires continuous daily adherence to maintain target BP control."
  },
  {
    roundNumber: 10,
    topic: "quickDecision",
    topicLabel: "Round 10 — Quick Decision",
    question: "A patient reports troublesome ankle swelling 3 weeks after starting Amlodipine. What is the best action?",
    options: [
      { id: "a", text: "Ignore it as irrelevant", isCorrect: false },
      { id: "b", text: "Double the amlodipine dose", isCorrect: false },
      { id: "c", text: "Seek pharmacist / doctor review for dose adjustment or combination therapy", isCorrect: true },
      { id: "d", text: "Stop all prescribed medicines permanently without medical consultation", isCorrect: false }
    ],
    explanation: "Prompt clinical review allows dose reduction or addition of an ACE inhibitor/ARB to alleviate CCB-induced oedema."
  }
];

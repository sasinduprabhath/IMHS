// ─── IMHS Interactive Learning Hub - Core Types ─────────────────────────────
// §3.2 Shared data model from the IMHS_Interactive_Learning_Hub spec.

// ─── Drug ────────────────────────────────────────────────────────────────────
export interface Drug {
  id: string;
  genericName: string;
  brandNames?: string[];
  drugClass: string;
  mechanismOfAction: string;
  mainIndications: string[];
  commonStrengths: string[];   // e.g. ["5 mg", "10 mg"]
  dosageForms: string[];       // e.g. ["Tablet"]
  administration: string;      // e.g. "Once daily"
  commonSideEffects: string[];
  keyInteractions: string[];
  contraindicationsPrecautions: string[];
  counsellingPoints: string[];
  antidote?: string;           // omit if none applicable
  drugClassOptions?: string[];
  moaOptions?: string[];
  sideEffectOptions?: string[];
  interactionOptions?: string[];
  antidoteOptions?: string[];
  quickDecisionScenario?: {
    scenario: string;
    options: string[];
    correctIndex: number;
  };
}

// ─── Prescription Case ───────────────────────────────────────────────────────
export interface PrescribedMedicine {
  name: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionProblem {
  id: string;
  label: string; // "Wrong dose", "Drug interaction", "Contraindication", etc.
}

export interface PrescriptionCase {
  id: string;
  imageUrl: string;         // path to prescription image
  patient: {
    name: string;
    age: number;
    sex: string;
    date: string;
  };
  medicines: PrescribedMedicine[];
  hasProblem: boolean;
  problemOptions?: PrescriptionProblem[];
  correctProblemIds?: string[];  // which problem options are correct
  expectedAction: 'dispense' | 'do_not_dispense';
  dispensingReason: string;
  expectedCounsellingPoints: string[];
}

// ─── Activity Attempt ────────────────────────────────────────────────────────
export type ActivityType =
  | 'prescription_review'
  | 'drug_classification'
  | 'module_assessment'
  | 'pharmacy_rush';

export interface ActivityAttempt {
  id: string;
  userId: string;
  activityType: ActivityType;
  moduleId?: string;
  drugId?: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  maxScore?: number;
  responses: Record<string, unknown>;
}

// ─── Pharmacy Rush ───────────────────────────────────────────────────────────
export type RoundTopic =
  | 'drugClass'
  | 'mainIndication'
  | 'mechanismOfAction'
  | 'availableStrength'
  | 'dosageForm'
  | 'administration'
  | 'commonSideEffect'
  | 'contraindication'
  | 'counsellingPoint'
  | 'quickDecision';

export interface RushRound {
  roundNumber: number;
  topic: RoundTopic;
  topicLabel: string;
  question: string;
  options: string[];
  correctIndex: number; // 0-based
}

// ─── Module Assessment ───────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  moduleId: string;
  statement: string;
  answer: boolean; // true = True, false = False
  topic?: string;  // used for grouping in results review
  explanation?: string;
}

// ─── Shared Option shape ─────────────────────────────────────────────────────
export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'revealed';

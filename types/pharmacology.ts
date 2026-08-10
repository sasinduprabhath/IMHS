export interface Drug {
  id: string;
  genericName: string;
  brandNames?: string[];
  drugClass: string;
  mechanismOfAction: string;
  mainIndications: string[];
  commonStrengths: string[];        // e.g. ["5 mg", "10 mg"]
  dosageForms: string[];            // e.g. ["Tablet"]
  administration: string;           // e.g. "Once daily"
  commonSideEffects: string[];
  keyInteractions: string[];
  contraindicationsPrecautions: string[];
  counsellingPoints: string[];
  antidote?: string;                // undefined if none applicable
}

export interface PrescriptionCase {
  id: string;
  title: string;
  imageUrl: string;
  patient: {
    name: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    date: string;
    weightKg?: number;
    diagnosis?: string;
  };
  medicines: {
    id: string;
    name: string;
    strength: string;
    dose: string;
    frequency: string;
    duration: string;
  }[];
  hasProblem: boolean;
  problemCategory?: 'Dosing Error' | 'Drug Interaction' | 'Contraindication' | 'Illegible Script' | 'Incomplete Prescription' | 'None';
  problemDescription?: string;
  problemOptions?: string[];
  expectedAction: 'dispense' | 'do_not_dispense';
  actionReason: string;
  expectedCounsellingPoints: string[];
}

export interface ModuleQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  topic: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface RushRoundOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface RushRound {
  roundNumber: number;
  topic: 'drugClass' | 'mainIndication' | 'mechanismOfAction' | 'availableStrength' | 'dosageForm' | 'administration' | 'commonSideEffect' | 'precaution' | 'counsellingPoint' | 'quickDecision';
  topicLabel: string;
  question: string;
  options: RushRoundOption[];
  explanation: string;
}

export interface ActivityAttempt {
  id: string;
  userId?: string;
  activityType: 'prescription_review' | 'drug_classification' | 'module_assessment' | 'pharmacy_rush';
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  details?: Record<string, any>;
}

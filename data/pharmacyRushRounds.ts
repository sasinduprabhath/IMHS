import type { RoundTopic } from "@/types/pharmacology";
import type { Drug } from "@/types/pharmacology";

// ─── Pharmacy Rush — Round Topic Order ───────────────────────────────────────
// Verified against the fully-worked Amlodipine example from the source PDF.
// "Administration" (Round 06) replaces "Interaction" — confirmed visually from spec.
// Update this list if the academic team provides a revised 10-round spec.

export const ROUND_TOPICS: { topic: RoundTopic; label: string }[] = [
  { topic: "drugClass",           label: "Drug Class" },
  { topic: "mainIndication",      label: "Main Indication" },
  { topic: "mechanismOfAction",   label: "Mechanism of Action" },
  { topic: "availableStrength",   label: "Available Strength" },
  { topic: "dosageForm",          label: "Dosage Form" },
  { topic: "administration",      label: "Administration" },
  { topic: "commonSideEffect",    label: "Common Side Effect" },
  { topic: "contraindication",    label: "Contraindication / Precaution" },
  { topic: "counsellingPoint",    label: "Patient Counselling Point" },
  { topic: "quickDecision",       label: "Pharmacist Quick Decision" },
];

// ─── Generate Rush Rounds from a Drug record ─────────────────────────────────
// Pure function — no randomness, consistent and testable.
// All 10 rounds pre-generated at game start (no per-round network requests).

export function generateRushRounds(drug: Drug) {
  // Helper: pick N wrong options from a pool that excludes the correct one
  function buildOptions(correct: string, wrongs: string[], count = 3): { options: string[]; correctIndex: number } {
    const wrongPool = wrongs.filter((w) => w !== correct).slice(0, count);
    // Pad with generic wrong answers if pool is thin
    const genericWrongs = [
      "ACE Inhibitor", "Beta Blocker", "Opioid Analgesic", "Inhaler",
      "IV infusion only", "500 mg", "1 g", "250 mg", "Twice weekly",
      "Every 4 hours", "Dry cough", "Hypoglycaemia", "Oral thrush",
    ].filter((g) => g !== correct && !wrongPool.includes(g));
    while (wrongPool.length < count) {
      wrongPool.push(genericWrongs[wrongPool.length] ?? "None of the above");
    }

    // Shuffle: put correct at index A (0)
    const opts = [correct, ...wrongPool.slice(0, 3)];
    // Rotate so correct isn't always first — fixed rotation to stay deterministic
    const rotation = drug.id.length % 4;
    const rotated = [...opts.slice(rotation), ...opts.slice(0, rotation)];
    const correctIndex = rotated.indexOf(correct);
    return { options: rotated, correctIndex };
  }

  const rounds = ROUND_TOPICS.map((rt, i) => {
    const roundNumber = i + 1;
    const { topic, label: topicLabel } = rt;

    switch (topic) {
      case "drugClass": {
        const { options, correctIndex } = buildOptions(drug.drugClass, [
          "ACE Inhibitor", "Beta Blocker (β-blocker)", "ARB (Angiotensin Receptor Blocker)", "Diuretic",
          "Nitrate", "Biguanide", "HMG-CoA Reductase Inhibitor", "PPI",
        ]);
        return { roundNumber, topic, topicLabel, question: `${drug.genericName} belongs to which drug class?`, options, correctIndex };
      }
      case "mainIndication": {
        const correct = drug.mainIndications[0];
        const { options, correctIndex } = buildOptions(correct, [
          "Asthma", "Type 1 Diabetes", "Bacterial infection", "Fungal infection",
          "Hypothyroidism", "Anaemia", "Epilepsy", "Depression",
        ]);
        return { roundNumber, topic, topicLabel, question: `${drug.genericName} is most commonly used for?`, options, correctIndex };
      }
      case "mechanismOfAction": {
        const correct = drug.mechanismOfAction.split(",")[0].trim();
        const { options, correctIndex } = buildOptions(correct, [
          "Blocks ACE (Angiotensin-Converting Enzyme)",
          "Stimulates β₂ adrenergic receptors",
          "Blocks H₂ histamine receptors",
          "Inhibits COX-2 enzyme",
          "Activates GABA-A receptors",
        ]);
        return { roundNumber, topic, topicLabel, question: `What is the main mechanism of action of ${drug.genericName}?`, options, correctIndex };
      }
      case "availableStrength": {
        const correct = drug.commonStrengths[0];
        const { options, correctIndex } = buildOptions(correct, [
          "50 mg", "500 mg", "1 g", "100 mcg", "250 mg", "2 g", "0.5 mg",
        ]);
        return { roundNumber, topic, topicLabel, question: `What is a common tablet/capsule strength of ${drug.genericName}?`, options, correctIndex };
      }
      case "dosageForm": {
        const correct = drug.dosageForms[0];
        const { options, correctIndex } = buildOptions(correct, [
          "Inhaler", "Eye drop", "Suppository", "Transdermal patch", "IV injection only",
        ]);
        return { roundNumber, topic, topicLabel, question: `The most common dosage form of ${drug.genericName} is?`, options, correctIndex };
      }
      case "administration": {
        const correct = drug.administration;
        const { options, correctIndex } = buildOptions(correct, [
          "Every hour", "Once weekly", "Only when symptoms occur", "Every 4 hours",
          "Twice daily after meals", "Every 12 hours on empty stomach",
        ]);
        return { roundNumber, topic, topicLabel, question: `${drug.genericName} is usually taken?`, options, correctIndex };
      }
      case "commonSideEffect": {
        const correct = drug.commonSideEffects[0];
        const { options, correctIndex } = buildOptions(correct, [
          "Hypoglycaemia", "Dry cough", "Oral thrush", "Hearing loss",
          "Visual disturbance", "Constipation", "Hair loss",
        ]);
        return { roundNumber, topic, topicLabel, question: `What is a common side effect of ${drug.genericName}?`, options, correctIndex };
      }
      case "contraindication": {
        const correct = drug.contraindicationsPrecautions[drug.contraindicationsPrecautions.length - 1];
        const { options, correctIndex } = buildOptions(correct, [
          "Monitor hearing only", "Monitor blood group only",
          "No monitoring required", "Monitor visual acuity only",
        ]);
        return { roundNumber, topic, topicLabel, question: `When prescribing ${drug.genericName}, what should be monitored or avoided?`, options, correctIndex };
      }
      case "counsellingPoint": {
        const correct = drug.counsellingPoints[0];
        const { options, correctIndex } = buildOptions(correct, [
          "Stop when symptoms improve completely",
          "Double the next dose if you miss one",
          "Take only when you feel the condition is active",
          "Share remaining tablets with family members",
        ]);
        return { roundNumber, topic, topicLabel, question: `Most important patient counselling point for ${drug.genericName}?`, options, correctIndex };
      }
      case "quickDecision": {
        if (drug.quickDecisionScenario) {
          return {
            roundNumber, topic, topicLabel,
            question: drug.quickDecisionScenario.scenario,
            options: drug.quickDecisionScenario.options,
            correctIndex: drug.quickDecisionScenario.correctIndex,
          };
        }
        return {
          roundNumber, topic, topicLabel,
          question: `A patient on ${drug.genericName} reports an unusual side effect. Best pharmacist action?`,
          options: [
            "Ignore the complaint",
            "Double the dose",
            "Advise patient to seek pharmacist/doctor review",
            "Stop all medicines permanently",
          ],
          correctIndex: 2,
        };
      }
    }
  });

  return rounds;
}

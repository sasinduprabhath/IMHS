"use client";

import React from "react";
import { PrescriptionSideBySideWizard } from "@/components/hub/PrescriptionSideBySideWizard";
import type { PrescriptionCase } from "@/types/pharmacology";

interface PrescriptionReviewActivityProps {
  prescriptionCase: PrescriptionCase;
}

export function PrescriptionReviewActivity({ prescriptionCase }: PrescriptionReviewActivityProps) {
  const formattedCase = {
    id: prescriptionCase.id,
    title: `Prescription Case Review - ${prescriptionCase.patient.name}`,
    imageUrl: prescriptionCase.imageUrl,
    groundTruth: {
      patientName: prescriptionCase.patient.name,
      patientAge: prescriptionCase.patient.age,
      patientGender: prescriptionCase.patient.sex,
      rxDate: prescriptionCase.patient.date,
      medicines: prescriptionCase.medicines,
      hasProblem: prescriptionCase.hasProblem,
      shouldDispense: prescriptionCase.expectedAction === "dispense",
      dispenseReason: prescriptionCase.dispensingReason,
      counsellingPoints: prescriptionCase.expectedCounsellingPoints,
    },
  };

  return <PrescriptionSideBySideWizard caseData={formattedCase} />;
}

export default PrescriptionReviewActivity;

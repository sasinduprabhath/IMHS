"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrescriptionCases() {
  try {
    if (!prisma.prescriptionCase) return [];
    return (await prisma.prescriptionCase.findMany({
      orderBy: { createdAt: "desc" },
    })) ?? [];
  } catch (error) {
    console.error("Error fetching prescription cases:", error);
    return [];
  }
}

export async function getPrescriptionCaseById(id: string) {
  try {
    if (!prisma.prescriptionCase) return null;
    return await prisma.prescriptionCase.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching prescription case:", error);
    return null;
  }
}

export async function createPrescriptionCase(data: {
  title: string;
  imageUrl: string;
  patientDetails: any;
  medicineDetails: any;
  hasProblem: boolean;
  problemOptions: string[];
  correctProblem?: string;
  shouldDispense: boolean;
  dispenseReason: string;
  counsellingPoints: string[];
  isPublished?: boolean;
}) {
  try {
    if (!prisma.prescriptionCase) {
      return {
        success: false,
        error: "Database client requires restart. Please run 'npm run dev' in terminal to load new Prisma models.",
      };
    }
    const created = await prisma.prescriptionCase.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        patientDetails: data.patientDetails,
        medicineDetails: data.medicineDetails,
        hasProblem: data.hasProblem,
        problemOptions: data.problemOptions,
        correctProblem: data.correctProblem,
        shouldDispense: data.shouldDispense,
        dispenseReason: data.dispenseReason,
        counsellingPoints: data.counsellingPoints,
        isPublished: data.isPublished ?? true,
      },
    });
    revalidatePath("/admin/learning-hub/prescriptions");
    revalidatePath("/dashboard/learning-hub/prescription-review");
    revalidatePath("/dashboard/learning-hub");
    return { success: true, case: created };
  } catch (error: any) {
    console.error("Error creating prescription case:", error);
    return { success: false, error: error.message || "Failed to create case" };
  }
}

export async function updatePrescriptionCase(
  id: string,
  data: Partial<{
    title: string;
    imageUrl: string;
    patientDetails: any;
    medicineDetails: any;
    hasProblem: boolean;
    problemOptions: string[];
    correctProblem: string;
    shouldDispense: boolean;
    dispenseReason: string;
    counsellingPoints: string[];
    isPublished: boolean;
  }>
) {
  try {
    if (!prisma.prescriptionCase) {
      return {
        success: false,
        error: "Database client requires restart. Please run 'npm run dev' in terminal to load new Prisma models.",
      };
    }
    const updated = await prisma.prescriptionCase.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/learning-hub/prescriptions");
    revalidatePath("/dashboard/learning-hub/prescription-review");
    return { success: true, case: updated };
  } catch (error: any) {
    console.error("Error updating prescription case:", error);
    return { success: false, error: error.message || "Failed to update case" };
  }
}

export async function deletePrescriptionCase(id: string) {
  try {
    if (!prisma.prescriptionCase) {
      return {
        success: false,
        error: "Database client requires restart. Please run 'npm run dev' in terminal to load new Prisma models.",
      };
    }
    await prisma.prescriptionCase.delete({ where: { id } });
    revalidatePath("/admin/learning-hub/prescriptions");
    revalidatePath("/dashboard/learning-hub/prescription-review");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting prescription case:", error);
    return { success: false, error: error.message || "Failed to delete case" };
  }
}

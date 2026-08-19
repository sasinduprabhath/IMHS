"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";

export async function getDrugKnowledgeList() {
  try {
    if (!prisma.drugKnowledge) return [];
    return (await prisma.drugKnowledge.findMany({
      orderBy: { genericName: "asc" },
    })) ?? [];
  } catch (error) {
    console.error("Error fetching drug knowledge list:", error);
    return [];
  }
}

export async function getDrugKnowledgeById(id: string) {
  try {
    if (!prisma.drugKnowledge) return null;
    const cleanId = sanitizeIdentifier(id, 100);
    return await prisma.drugKnowledge.findUnique({ where: { id: cleanId } });
  } catch (error) {
    console.error("Error fetching drug knowledge by id:", error);
    return null;
  }
}

export async function createDrugKnowledge(data: {
  genericName: string;
  drugClass: string;
  drugClassOptions: string[];
  mechanismOfAction: string;
  moaOptions: string[];
  sideEffects: string[];
  sideEffectOptions: string[];
  interactions: string[];
  interactionOptions: string[];
  antidote?: string;
  antidoteOptions?: string[];
  isPublished?: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    const created = await prisma.drugKnowledge.create({
      data: {
        genericName: sanitizeString(data.genericName, 150),
        drugClass: sanitizeString(data.drugClass, 150),
        drugClassOptions: (data.drugClassOptions || []).map((s) => sanitizeString(s, 150)),
        mechanismOfAction: sanitizeString(data.mechanismOfAction, 1000),
        moaOptions: (data.moaOptions || []).map((s) => sanitizeString(s, 500)),
        sideEffects: (data.sideEffects || []).map((s) => sanitizeString(s, 200)),
        sideEffectOptions: (data.sideEffectOptions || []).map((s) => sanitizeString(s, 200)),
        interactions: (data.interactions || []).map((s) => sanitizeString(s, 200)),
        interactionOptions: (data.interactionOptions || []).map((s) => sanitizeString(s, 200)),
        antidote: data.antidote ? sanitizeString(data.antidote, 150) : null,
        antidoteOptions: (data.antidoteOptions || []).map((s) => sanitizeString(s, 150)),
        isPublished: Boolean(data.isPublished ?? true),
      },
    });
    revalidatePath("/admin/learning-hub/drugs");
    revalidatePath("/dashboard/learning-hub/drug-classification");
    return { success: true, drug: created };
  } catch (error: any) {
    console.error("Error creating drug knowledge:", error);
    return { success: false, error: error.message || "Failed to create drug entry" };
  }
}

export async function updateDrugKnowledge(
  id: string,
  data: Partial<{
    genericName: string;
    drugClass: string;
    drugClassOptions: string[];
    mechanismOfAction: string;
    moaOptions: string[];
    sideEffects: string[];
    sideEffectOptions: string[];
    interactions: string[];
    interactionOptions: string[];
    antidote: string;
    antidoteOptions: string[];
    isPublished: boolean;
  }>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    const updated = await prisma.drugKnowledge.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/learning-hub/drugs");
    revalidatePath("/dashboard/learning-hub/drug-classification");
    return { success: true, drug: updated };
  } catch (error: any) {
    console.error("Error updating drug knowledge:", error);
    return { success: false, error: error.message || "Failed to update drug entry" };
  }
}

export async function deleteDrugKnowledge(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    await prisma.drugKnowledge.delete({ where: { id } });
    revalidatePath("/admin/learning-hub/drugs");
    revalidatePath("/dashboard/learning-hub/drug-classification");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting drug knowledge:", error);
    return { success: false, error: error.message || "Failed to delete drug entry" };
  }
}

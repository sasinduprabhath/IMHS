"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    return await prisma.drugKnowledge.findUnique({ where: { id } });
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
    const created = await prisma.drugKnowledge.create({
      data: {
        genericName: data.genericName,
        drugClass: data.drugClass,
        drugClassOptions: data.drugClassOptions,
        mechanismOfAction: data.mechanismOfAction,
        moaOptions: data.moaOptions,
        sideEffects: data.sideEffects,
        sideEffectOptions: data.sideEffectOptions,
        interactions: data.interactions,
        interactionOptions: data.interactionOptions,
        antidote: data.antidote || null,
        antidoteOptions: data.antidoteOptions || [],
        isPublished: data.isPublished ?? true,
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
    await prisma.drugKnowledge.delete({ where: { id } });
    revalidatePath("/admin/learning-hub/drugs");
    revalidatePath("/dashboard/learning-hub/drug-classification");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting drug knowledge:", error);
    return { success: false, error: error.message || "Failed to delete drug entry" };
  }
}

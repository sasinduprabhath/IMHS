import React from "react";
import { getAllPharmacyRushConfigs } from "@/actions/pharmacy-rush-actions";
import { getDrugKnowledgeList } from "@/actions/drug-actions";
import { PharmacyRushEditor, type RushConfigItem } from "@/components/admin/PharmacyRushEditor";
import { DRUGS } from "@/data/drugs";

export const metadata = {
  title: "Pharmacy Rush Configurator - Admin CMS",
};

export default async function AdminPharmacyRushPage() {
  const [rawConfigs, dbDrugs] = await Promise.all([
    getAllPharmacyRushConfigs(),
    getDrugKnowledgeList(),
  ]);

  const configs: RushConfigItem[] = rawConfigs.map((cfg) => ({
    id: cfg.id,
    medicineName: cfg.medicineName,
    isActive: cfg.isActive,
    timePerRoundSec: cfg.timePerRoundSec,
    createdAt: cfg.createdAt,
    rounds: cfg.rounds.map((r) => ({
      roundNumber: r.roundNumber,
      challengeType: r.challengeType,
      questionText: r.questionText,
      options: (r.options as string[]) || [],
      correctOption: r.correctOption,
      pointsValue: r.pointsValue,
    })),
  }));

  const combinedDrugs = dbDrugs.length > 0
    ? dbDrugs.map((d) => ({ id: d.id, genericName: d.genericName, drugClass: d.drugClass }))
    : DRUGS;

  return <PharmacyRushEditor initialConfigs={configs} availableDrugs={combinedDrugs} />;
}

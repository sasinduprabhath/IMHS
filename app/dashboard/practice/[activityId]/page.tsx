import { notFound } from "next/navigation";

// This dynamic route is currently unused — specific activity routes are used instead:
// /dashboard/practice/prescription-review
// /dashboard/practice/drug-classification
// /dashboard/practice/module-assessment
// /dashboard/practice/pharmacy-rush
// This stub satisfies the Next.js type validator.

interface Props {
  params: Promise<{ activityId: string }>;
}

export default async function ActivityPage({ params }: Props) {
  notFound();
}

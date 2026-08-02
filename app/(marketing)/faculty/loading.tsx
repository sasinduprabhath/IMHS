import React from "react";
import { Skeleton, FacultyCardSkeleton } from "@/components/ui/skeleton";

export default function FacultyLoading() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-4 w-36 mx-auto rounded-full" />
        <Skeleton className="h-10 w-96 mx-auto" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <FacultyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

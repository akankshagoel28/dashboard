import React from "react";
import { Progress } from "@/components/ui/progress";

function ProgressTracker({ completionStatus }) {
  const overallProgress =
    Object.values(completionStatus).reduce(
      (acc, curr) => acc + curr,
      0
    ) / 4;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">Masterlist Setup</h1>
      <div className="flex items-center gap-4 mb-4">
        <Progress value={overallProgress * 100} className="w-full" />
        <span className="text-sm font-medium">
          {Math.round(overallProgress * 100)}% Complete
        </span>
      </div>
    </div>
  );
}

export default ProgressTracker;

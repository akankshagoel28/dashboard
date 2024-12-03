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
    </div>
  );
}

export default ProgressTracker;

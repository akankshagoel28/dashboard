import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

function SidebarNavigation({
  sections,
  activeSection,
  setActiveSection,
  completionStatus,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeSection === section.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {completionStatus[section.id] === 100 ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-500">
                      {section.description}
                    </div>
                  </div>
                  {activeSection === section.id && (
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Status</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(completionStatus).some(
            ([_, value]) => value < 100
          ) ? (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete the remaining sections to finish setup
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All sections are complete
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SidebarNavigation;

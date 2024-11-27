// components/dashboard/masterlist-dashboard.jsx
"use client";
import React, { useState } from "react";
import ProgressTracker from "./progress-tracker";
import SidebarNavigation from "./sidebar-navigation";
import MainContent from "./main-content";

function MasterlistDashboard() {
  const [completionStatus, setCompletionStatus] = useState({
    items: 0,
    bom: 0,
    processes: 0,
    processSteps: 0,
  });

  const [activeSection, setActiveSection] = useState("items");

  const sections = [
    {
      id: "items",
      title: "Items Master",
      description: "Manage item definitions and properties",
    },
    {
      id: "bom",
      title: "Bill of Materials",
      description: "Define item components and relationships",
    },
    {
      id: "processes",
      title: "Processes",
      description: "Configure production processes",
    },
    {
      id: "processSteps",
      title: "Process Steps",
      description: "Set up detailed process steps",
    },
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <div className="flex justify-end mb-4"></div>
      <ProgressTracker completionStatus={completionStatus} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <SidebarNavigation
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            completionStatus={completionStatus}
          />
        </div>

        <div className="col-span-9">
          <MainContent
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
      </div>
    </div>
  );
}

export default MasterlistDashboard;

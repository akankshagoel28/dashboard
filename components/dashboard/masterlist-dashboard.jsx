"use client";
import React, { useState } from "react";
import ProgressTracker from "./progress-tracker";
import SidebarNavigation from "./sidebar-navigation";
import MainContent from "./main-content";

function MasterlistDashboard() {
  const [completionStatus, setCompletionStatus] = useState({
    items: 0,
    bom: 0,
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
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <div className="flex justify-end mb-4"></div>
      <ProgressTracker />

      <div className="md:grid-cols-12 md:gap-6 md:grid">
        <div className="md:col-span-3 md:block hidden">
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

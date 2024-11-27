// components/dashboard/main-content.jsx
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ItemsMaster from "@/components/sections/items-master";
import BomMaster from "@/components/sections/bom-master";
import ProcessMaster from "@/components/sections/process-master";
import ProcessStepsMaster from "@/components/sections/process-steps-master";

function MainContent({ sections, activeSection, setActiveSection }) {
  return (
    <Tabs value={activeSection} onValueChange={setActiveSection}>
      <TabsList className="mb-4">
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.title}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="items">
        <ItemsMaster />
      </TabsContent>

      <TabsContent value="bom">
        <BomMaster />
      </TabsContent>

      <TabsContent value="processes">
        <ProcessMaster />
      </TabsContent>

      <TabsContent value="processSteps">
        <ProcessStepsMaster />
      </TabsContent>
    </Tabs>
  );
}

export default MainContent;
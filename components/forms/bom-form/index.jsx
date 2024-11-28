import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ItemForm from "@/components/forms/item-form";

function BomForm({
  purchaseItems,
  onExistingSubmit,
  onNewSubmit,
  isComponentAlreadyAdded,
  onClose,
}) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("existing");

  const handleComponentSelect = (component) => {
    if (isComponentAlreadyAdded(component.id)) {
      return;
    }
    setSelectedComponent(component);
    setQuantity("1");
  };

  const handleQuantitySubmit = () => {
    if (!selectedComponent) return;
    onExistingSubmit(selectedComponent, quantity);
  };

  const filteredItems = purchaseItems.filter((item) =>
    item.internal_item_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex-1"
    >
      <div className="px-6">
        <TabsList className="w-full">
          <TabsTrigger value="existing" className="flex-1">
            Existing Components
          </TabsTrigger>
          <TabsTrigger value="new" className="flex-1">
            Create New Component
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="existing" className="flex-1 mt-2">
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="border-y">
          <div className="divide-y p-6">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No purchase items found
              </div>
            ) : (
              filteredItems.map((item) => {
                const isAdded = isComponentAlreadyAdded(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`p-4 ${
                      isAdded
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent cursor-pointer"
                    } ${
                      selectedComponent?.id === item.id
                        ? "border-primary"
                        : ""
                    }`}
                    onClick={() =>
                      !isAdded && handleComponentSelect(item)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {item.internal_item_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          UoM: {item.uom}
                        </div>
                      </div>
                      {isAdded ? (
                        <span className="text-sm text-muted-foreground">
                          Already added
                        </span>
                      ) : (
                        <Button variant="ghost" size="sm">
                          Select
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        {selectedComponent && (
          <div className="p-6 border-t space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full"
              />
            </div>
            <Button className="w-full" onClick={handleQuantitySubmit}>
              Add Component
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="new" className="border-t">
        <ScrollArea className="h-[500px]">
          <div className="p-6">
            <ItemForm
              onSubmit={onNewSubmit}
              defaultType="purchase"
              disableTypeChange={true}
            />
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

export default BomForm;

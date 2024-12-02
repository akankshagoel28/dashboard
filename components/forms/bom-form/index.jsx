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
}) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("existing");
  const [quantityError, setQuantityError] = useState("");

  const handleComponentSelect = (component) => {
    if (isComponentAlreadyAdded(component.id)) {
      return;
    }
    setSelectedComponent(component);
    setQuantity("1");
    setQuantityError("");
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);

    const numValue = parseFloat(value);
    if (!value) {
      setQuantityError("Quantity is required");
    } else if (isNaN(numValue)) {
      setQuantityError("Please enter a valid number");
    } else if (numValue < 1) {
      setQuantityError("Quantity must be at least 1");
    } else if (numValue > 100) {
      setQuantityError("Quantity cannot exceed 100");
    } else if (!Number.isInteger(numValue)) {
      setQuantityError("Quantity must be a whole number");
    } else {
      setQuantityError("");
    }
  };

  const handleQuantitySubmit = () => {
    if (!selectedComponent) return;

    const numQuantity = parseInt(quantity);
    if (!quantityError && numQuantity >= 1 && numQuantity <= 100) {
      onExistingSubmit(selectedComponent, numQuantity);
    }
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
      className="flex flex-col h-full"
    >
      <div className="px-6 flex-shrink-0">
        <TabsList className="w-full">
          <TabsTrigger value="existing" className="flex-1">
            Existing Components
          </TabsTrigger>
          <TabsTrigger value="new" className="flex-1">
            Create New Component
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="existing"
        className="flex-1 flex flex-col mt-2"
      >
        <div className="px-6 pb-4 flex-shrink-0">
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

        <div className="flex-1 min-h-0">
          {" "}
          {/* This ensures proper scrolling */}
          <ScrollArea className="h-[calc(100vh-400px)]">
            {" "}
            {/* Adjust the height as needed */}
            <div className="divide-y px-6">
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
                      className={`p-4 mb-2 ${
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
        </div>

        {selectedComponent && (
          <div className="p-6 border-t space-y-4 flex-shrink-0 bg-background">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (1-100)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                step="1"
                value={quantity}
                onChange={handleQuantityChange}
                className={`w-full ${
                  quantityError ? "border-red-500" : ""
                }`}
              />
              {quantityError && (
                <div className="text-sm text-red-500">
                  {quantityError}
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleQuantitySubmit}
              disabled={!!quantityError}
            >
              Add Component
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="new" className="flex-1">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {" "}
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

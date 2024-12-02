import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function getMissingFields(item) {
  const missing = [];
  if (!item.type) missing.push("Type");
  if (!item.uom) missing.push("UoM");
  if (!item.max_buffer) missing.push("Max Buffer");
  if (!item.min_buffer) missing.push("Min Buffer");
  if (!item.customer_item_name) missing.push("Customer Item Name");
  if (
    ["sell", "purchase"].includes(item.type) &&
    !item.additional_attributes?.scrap_type
  ) {
    missing.push("Scrap Type");
  }
  return missing;
}

function PendingItems({ items, onResolve }) {
  const pendingItems = items.filter((item) => {
    return !(
      item.internal_item_name &&
      item.tenant_id &&
      item.item_description &&
      item.type &&
      item.uom &&
      item.max_buffer &&
      item.min_buffer &&
      item.customer_item_name &&
      (!["sell", "purchase"].includes(item.type) ||
        item.additional_attributes?.scrap_type)
    );
  });

  if (pendingItems.length === 0) return null;

  return (
    <Card className="bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <AlertCircle className="h-5 w-5" />
          Pending Items Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div
              key={`${item.tenant_id}-${item.internal_item_name}`}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
            >
              <div>
                <h4 className="font-medium">
                  {item.internal_item_name}
                </h4>
                <p className="text-sm text-gray-500">
                  Missing: {getMissingFields(item).join(", ")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResolve(item)}
              >
                Resolve Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default PendingItems;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BomTable from "@/components/tables/bom-table";
import { useBom } from "@/hooks/use-bom";
import { useItems } from "@/hooks/use-items";
import { useToast } from "@/hooks/use-toast";
import BulkUpload from "@/components/bulk-upload";
import BomForm from "@/components/forms/bom-form";

function BomMaster() {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [componentDialogOpen, setComponentDialogOpen] =
    useState(false);

  const {
    bomItems,
    isLoading,
    error,
    fetchBomByItemId,
    addBom,
    updateBom,
    deleteBom,
  } = useBom();
  const { items, addItem, fetchItems } = useItems();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const purchaseItems = items.filter(
    (item) => item.type === "purchase"
  );
  const sellItems = items.filter((item) => item.type === "sell");

  const getItemName = (id) => {
    const item = items.find((item) => item.id === parseInt(id));
    return item?.internal_item_name || "Select an item";
  };

  const isComponentAlreadyAdded = (componentId) => {
    return bomItems.some((item) => item.component_id === componentId);
  };

  const handleItemSelect = async (itemId) => {
    setSelectedItemId(itemId);
    try {
      await fetchBomByItemId(itemId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch BOM entries",
      });
    }
  };

  const handleExistingComponentSubmit = async (
    component,
    quantity
  ) => {
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "Please enter a valid quantity greater than 0",
      });
      return;
    }

    const bomData = {
      item_id: parseInt(selectedItemId),
      component_id: component.id,
      quantity: parsedQuantity,
      created_by: "user1",
      last_updated_by: "user1",
    };

    const result = await addBom(bomData);

    if (result.success) {
      toast({
        title: "Success",
        description: "Component added to BOM successfully",
      });
      setComponentDialogOpen(false);
      fetchBomByItemId(selectedItemId);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleNewComponentSubmit = async (data) => {
    try {
      const componentData = {
        ...data,
        type: "purchase",
      };

      const newItemResult = await addItem(componentData);
      if (!newItemResult.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create component",
        });
        return;
      }

      const bomData = {
        item_id: parseInt(selectedItemId),
        component_id: newItemResult.data.id,
        quantity: 1,
        created_by: "user1",
        last_updated_by: "user1",
      };

      const result = await addBom(bomData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Component created and added successfully",
        });
        setComponentDialogOpen(false);
        await fetchItems();
        fetchBomByItemId(selectedItemId);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create component",
      });
    }
  };

  const handleBulkUpload = async (data) => {
    try {
      const results = await Promise.all(
        data.map((row) =>
          addBom({
            item_id: parseInt(selectedItemId),
            component_id: parseInt(row.component_id),
            quantity: parseFloat(row.quantity),
            created_by: "user1",
            last_updated_by: "user1",
          })
        )
      );

      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        toast({
          variant: "warning",
          title: "Partial Success",
          description: `${
            results.length - failures.length
          } items added, ${failures.length} failed`,
        });
      } else {
        toast({
          title: "Success",
          description: `${results.length} items added successfully`,
        });
      }

      fetchBomByItemId(selectedItemId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process bulk upload",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteBom(id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Component removed successfully",
      });
      fetchBomByItemId(selectedItemId);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleQuantityUpdate = async (bomItem, newQuantity) => {
    try {
      const result = await updateBom(bomItem.id, {
        ...bomItem,
        quantity: newQuantity,
        last_updated_by: "user1",
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Quantity updated successfully",
        });
        fetchBomByItemId(selectedItemId);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bill of Materials</h2>
        <div className="flex gap-4">
          <Select
            onValueChange={handleItemSelect}
            value={selectedItemId?.toString()}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select an item">
                {selectedItemId
                  ? getItemName(selectedItemId)
                  : "Select an item"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sellItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.internal_item_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setComponentDialogOpen(true)}
            disabled={!selectedItemId}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Component
          </Button>
          <BulkUpload
            onUpload={handleBulkUpload}
            templateFields={["component_id", "quantity"]}
          />
        </div>
      </div>

      <Dialog
        open={componentDialogOpen}
        onOpenChange={(open) => {
          setComponentDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[800px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Add Component</DialogTitle>
            <DialogDescription>
              Select an existing purchase item or create a new one to
              use as a component
            </DialogDescription>
          </DialogHeader>
          <BomForm
            purchaseItems={purchaseItems}
            onExistingSubmit={handleExistingComponentSubmit}
            onNewSubmit={handleNewComponentSubmit}
            isComponentAlreadyAdded={isComponentAlreadyAdded}
            onClose={() => setComponentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        selectedItemId && (
          <BomTable
            bomItems={bomItems}
            items={items}
            onQuantityChange={handleQuantityUpdate}
            onDelete={handleDelete}
          />
        )
      )}
    </div>
  );
}

export default BomMaster;

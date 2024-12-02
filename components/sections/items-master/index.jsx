// components/sections/items-master/index.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import ItemForm from "@/components/forms/item-form";
import ItemsTable from "@/components/tables/items-table";
import PendingItems from "@/components/sections/pending-items";
import { useItems } from "@/hooks/use-items";
import { useToast } from "@/hooks/use-toast";
import ItemsBulkUpload from "@/components/items-bulk-upload";

function ItemsMaster() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    fetchItems,
  } = useItems();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (data) => {
    const result = editData
      ? await updateItem(editData.id, data)
      : await addItem(data);

    if (result.success) {
      toast({
        title: "Success",
        description: `Item ${
          editData ? "updated" : "created"
        } successfully`,
      });
      setOpen(false);
      setEditData(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await deleteItem(item.id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleBulkUpload = async (data) => {
    try {
      const results = await Promise.all(
        data.map((itemData) => addItem(itemData))
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

      fetchItems(); // Refresh the items list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process bulk upload",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PendingItems
        items={items}
        onResolve={(item) => {
          setEditData(item);
          setOpen(true);
        }}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Items Master</h2>
        <div className="flex gap-4">
          {" "}
          {/* Added wrapper div for buttons */}
          <ItemsBulkUpload
            onUpload={handleBulkUpload}
            existingItems={items}
          />
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) setEditData(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[90vh] p-0">
              <div className="flex flex-col h-full">
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle>
                    {editData ? "Edit Item" : "Add New Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {editData
                      ? "Edit the details of the existing item below."
                      : "Fill in the details to create a new item. Required fields are marked with *"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6">
                  <ItemForm
                    onSubmit={handleSubmit}
                    editData={editData}
                    existingItems={items} // Pass your items array here
                  />
                </div>
              </div>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ItemsTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default ItemsMaster;

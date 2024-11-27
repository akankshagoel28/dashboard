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
import ProcessStepForm from "@/components/forms/process-step-form";
import ProcessStepTable from "@/components/tables/process-step-table";
import { useProcessSteps } from "@/hooks/use-process-steps";
import { useItems } from "@/hooks/use-items";
import { useProcesses } from "@/hooks/use-processes";
import { useToast } from "@/hooks/use-toast";

function ProcessStepsMaster() {
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editData, setEditData] = useState(null);
  const {
    processSteps,
    isLoading,
    error,
    fetchProcessSteps,
    addProcessStep,
    updateProcessStep,
  } = useProcessSteps();
  const { items, fetchItems } = useItems(); // Make sure we destructure fetchItems
  const { processes, fetchProcesses } = useProcesses();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
    fetchProcesses();
    console.log("Processes:", processes); // Debug log
  }, [fetchItems, fetchProcesses, processes]);

  const handleItemSelect = async (itemId) => {
    setSelectedItemId(itemId);
    console.log("Selected Item ID:", itemId); // Debug log
    const result = await fetchProcessSteps(itemId);
    console.log("Fetched Process Steps:", result); // Debug log
  };

  const handleEdit = (process) => {
    setEditData(process);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteProcess(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Process deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSubmit = async (data) => {
    console.log("Form Data:", data); // Debug log

    try {
      const formattedData = {
        item_id: parseInt(selectedItemId),
        process_id: parseInt(data.process_id),
        sequence: parseInt(data.sequence),
        created_by: "user1",
        last_updated_by: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Formatted Data:", formattedData); // Debug log

      const result = editData
        ? await updateProcessStep(editData.id, formattedData)
        : await addProcessStep(formattedData);

      console.log("API Response:", result); // Debug log

      if (result.success) {
        toast({
          title: "Success",
          description: `Process step ${
            editData ? "updated" : "created"
          } successfully`,
        });
        setOpen(false);
        setEditData(null);
        await fetchProcessSteps(selectedItemId);
      } else {
        throw new Error(
          result.error || "Failed to save process step"
        );
      }
    } catch (error) {
      console.error("Error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Process Steps</h2>
        <div className="flex gap-4">
          <Select
            onValueChange={handleItemSelect}
            value={selectedItemId?.toString()}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.internal_item_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setOpen(true)}
            disabled={!selectedItemId}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) setEditData(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-4">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Process Step" : "Add Process Step"}
            </DialogTitle>
            <DialogDescription>
              Fill in the process step details below.
            </DialogDescription>
          </DialogHeader>
          <ProcessStepForm
            onSubmit={handleSubmit}
            initialData={editData}
            selectedItemId={selectedItemId}
            processes={processes || []} // Ensure processes is never undefined
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        selectedItemId && (
          <>
            <div className="mb-4">
              <h3 className="font-medium">
                Steps for:{" "}
                {
                  items.find((i) => i.id === parseInt(selectedItemId))
                    ?.internal_item_name
                }
              </h3>
              <div className="text-sm text-muted-foreground">
                Available Processes: {processes?.length || 0}
              </div>
            </div>
            <ProcessStepTable
              processSteps={processSteps}
              processes={processes || []} // Ensure processes is never undefined
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )
      )}
    </div>
  );
}

export default ProcessStepsMaster;

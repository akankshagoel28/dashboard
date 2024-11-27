// components/sections/process-master/index.jsx
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
import ProcessForm from "@/components/forms/process-form";
import ProcessTable from "@/components/tables/process-table";
import { useProcesses } from "@/hooks/use-processes";
import { useToast } from "@/hooks/use-toast";

function ProcessMaster() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    processes,
    isLoading,
    error,
    fetchProcesses,
    addProcess,
    updateProcess,
    deleteProcess,
  } = useProcesses();
  const { toast } = useToast();

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const handleSubmit = async (data) => {
    try {
      const result = editData
        ? await updateProcess(editData.id, data)
        : await addProcess(data);

      if (result.success) {
        toast({
          title: "Success",
          description: `Process ${
            editData ? "updated" : "created"
          } successfully`,
        });
        setOpen(false);
        setEditData(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Process Management</h2>
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Process
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) setEditData(null);
        }}
      >
        <DialogContent className="sm:max-w-[800px] p-4">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Process" : "Add Process"}
            </DialogTitle>
            <DialogDescription>
              Fill in the process details below.
            </DialogDescription>
          </DialogHeader>
          <ProcessForm
            onSubmit={handleSubmit}
            initialData={editData}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ProcessTable
          processes={processes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default ProcessMaster;

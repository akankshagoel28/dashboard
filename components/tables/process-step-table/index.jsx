import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ProcessStepTable({
  processSteps = [],
  processes = [],
  onEdit,
  onDelete,
}) {
  const [deleteId, setDeleteId] = useState(null);

  const getProcessName = (processId) => {
    const process = processes.find((p) => p.id === processId);
    return process?.process_name || "Unknown Process";
  };

  const validateSequences = (steps) => {
    const sequences = steps
      .map((step) => step.sequence)
      .sort((a, b) => a - b);
    if (sequences.length === 0) return true;

    for (let i = 1; i < sequences.length; i++) {
      if (sequences[i] !== sequences[i - 1] + 1) {
        return false;
      }
    }
    return true;
  };

  const sortedSteps = [...processSteps].sort(
    (a, b) => a.sequence - b.sequence
  );
  const hasValidSequences = validateSequences(sortedSteps);

  return (
    <div className="space-y-4">
      {!hasValidSequences && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Process steps have sequence gaps or duplicates
          </AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Process Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSteps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No process steps defined
              </TableCell>
            </TableRow>
          ) : (
            sortedSteps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>{step.sequence}</TableCell>
                <TableCell>
                  {getProcessName(step.process_id)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(step)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(step.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Process Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProcessStepTable;

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
import { PencilIcon, Trash2Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ProcessTable({ processes = [], onEdit, onDelete }) {
  // Add default empty array
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Process Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Factory ID</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No processes found
            </TableCell>
          </TableRow>
        ) : (
          processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell>{process.process_name}</TableCell>
              <TableCell>{process.type}</TableCell>
              <TableCell>{process.factory_id}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(process)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(process.id)}
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
  );
}

export default ProcessTable;

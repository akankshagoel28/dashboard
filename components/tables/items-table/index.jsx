import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ItemsTable({ items, onEdit, onDelete }) {
  const getStatus = (item) => {
    const isComplete = Boolean(
      item.internal_item_name &&
        item.tenant_id &&
        item.item_description &&
        item.type &&
        item.uom &&
        item.max_buffer &&
        item.min_buffer &&
        item.customer_item_name &&
        item.additional_attributes?.avg_weight_needed &&
        (!["sell", "purchase"].includes(item.type) ||
          item.additional_attributes?.scrap_type)
    );

    return isComplete ? "complete" : "pending";
  };

  const getStatusBadge = (item) => {
    const status = getStatus(item);
    return (
      <Badge variant={status === "pending" ? "secondary" : "success"}>
        {status === "pending" ? "Pending" : "Complete"}
      </Badge>
    );
  };
  const getTypeBadge = (type) => {
    return (
      <Badge variant={type === "sell" ? "default" : "secondary"}>
        {type}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>UoM</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={`${item.tenant_id}-${item.internal_item_name}`}
          >
            <TableCell className="font-medium">
              {item.internal_item_name}
            </TableCell>
            <TableCell>{getTypeBadge(item.type)}</TableCell>
            <TableCell>{item.uom || "-"}</TableCell>
            <TableCell>{getStatusBadge(item)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will
                        permanently delete the item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => onDelete(item)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ItemsTable;

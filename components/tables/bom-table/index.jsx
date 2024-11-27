// components/tables/bom-table/index.jsx
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
import { Input } from "@/components/ui/input";
import { Trash2Icon, Check, X, Pencil } from "lucide-react";
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

function BomTable({ bomItems, items, onQuantityChange, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState("");

  const handleEdit = (bom) => {
    setEditingId(bom.id);
    setEditingQuantity(bom.quantity.toString());
  };

  const handleSave = (bom) => {
    const quantity = parseFloat(editingQuantity);
    if (!isNaN(quantity) && quantity > 0) {
      onQuantityChange(bom, quantity);
    }
    setEditingId(null);
    setEditingQuantity("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingQuantity("");
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>UoM</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!bomItems || bomItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                No components added yet
              </TableCell>
            </TableRow>
          ) : (
            bomItems.map((bom) => {
              const component = items.find(
                (item) => item.id === parseInt(bom.component_id)
              );
              return (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">
                    {component?.internal_item_name ||
                      "Unknown Component"}
                  </TableCell>
                  <TableCell>
                    {editingId === bom.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editingQuantity}
                          onChange={(e) =>
                            setEditingQuantity(e.target.value)
                          }
                          className="w-24"
                          min="0.01"
                          step="0.01"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(bom)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{bom.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(bom)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{component?.uom || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(bom.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this component from the
              BOM?
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

export default BomTable;

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileDown, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Papa from "papaparse";

function BulkUpload({ onUpload, items, existingBomItems }) {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const templateFields = [
    "item_id",
    "component_id",
    "quantity",
    "created_by",
    "last_updated_by",
  ];

  const sellItems = items.filter((item) => item.type === "sell");
  const purchaseItems = items.filter(
    (item) => item.type === "purchase"
  );

  const downloadTemplate = () => {
    const csv = Papa.unparse([templateFields]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);

      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          const initializedData = results.data
            .filter((row) =>
              Object.values(row).some((value) => value !== "")
            )
            .map((row) => ({
              item_id: row.item_id || "",
              component_id: row.component_id || "",
              quantity: row.quantity || "1",
              created_by: row.created_by || "user1",
              last_updated_by: row.last_updated_by || "user1",
            }));
          setCsvData(initializedData);
        },
        error: (error) => {
          setErrors([error.message]);
        },
      });
    }
  };

  const isComponentAlreadyInBom = (itemId, componentId) => {
    if (!itemId || !componentId) return false;

    return existingBomItems.some(
      (bomItem) =>
        bomItem.item_id === parseInt(itemId) &&
        bomItem.component_id === parseInt(componentId)
    );
  };

  const validateData = (data) => {
    const errors = [];
    const sellItemIds = sellItems.map((item) => item.id.toString());
    const purchaseItemIds = purchaseItems.map((item) =>
      item.id.toString()
    );
    const combinationsInCsv = new Set();

    data.forEach((row, index) => {
      const rowNum = index + 1;

      // Validate item_id
      if (!row.item_id) {
        errors.push(`Row ${rowNum}: Item ID is required`);
      } else if (!sellItemIds.includes(row.item_id?.toString())) {
        errors.push(
          `Row ${rowNum}: Invalid item_id. Item must be of type "sell"`
        );
      }

      // Validate component_id
      if (!row.component_id) {
        errors.push(`Row ${rowNum}: Component ID is required`);
      } else if (
        !purchaseItemIds.includes(row.component_id?.toString())
      ) {
        errors.push(
          `Row ${rowNum}: Invalid component_id. Component must be of type "purchase"`
        );
      } else {
        const combination = `${row.item_id}-${row.component_id}`;

        // Check if component is already in ANY BOM for this item
        if (isComponentAlreadyInBom(row.item_id, row.component_id)) {
          const itemName = sellItems.find(
            (item) => item.id.toString() === row.item_id?.toString()
          )?.internal_item_name;
          const componentName = purchaseItems.find(
            (item) =>
              item.id.toString() === row.component_id?.toString()
          )?.internal_item_name;
          errors.push(
            `Row ${rowNum}: Component "${componentName}" is already in the BOM for item "${itemName}"`
          );
        }

        // Check for duplicates within the current CSV upload
        if (combinationsInCsv.has(combination)) {
          errors.push(
            `Row ${rowNum}: This item-component combination appears multiple times in the upload`
          );
        }
        combinationsInCsv.add(combination);
      }

      // Validate quantity
      const quantity = parseInt(row.quantity);
      if (!row.quantity) {
        errors.push(`Row ${rowNum}: Quantity is required`);
      } else if (
        isNaN(quantity) ||
        quantity < 1 ||
        quantity > 100 ||
        !Number.isInteger(quantity)
      ) {
        errors.push(
          `Row ${rowNum}: Quantity must be a whole number between 1 and 100`
        );
      }

      if (!row.created_by?.trim()) {
        errors.push(`Row ${rowNum}: created_by is required`);
      }
      if (!row.last_updated_by?.trim()) {
        errors.push(`Row ${rowNum}: last_updated_by is required`);
      }
    });

    return errors;
  };

  const handleCellChange = (rowIndex, field, value) => {
    const updatedData = [...csvData];
    // Ensure we're storing the value as a string initially
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: value || "", // Use empty string instead of null/undefined
    };
    setCsvData(updatedData);
    setErrors(validateData(updatedData));
  };

  const handleUpload = async () => {
    const validationErrors = validateData(csvData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    try {
      const preparedData = csvData.map((row) => {
        // Only parse to integer if we have a valid value
        const itemId = row.item_id ? parseInt(row.item_id) : null;
        const componentId = row.component_id
          ? parseInt(row.component_id)
          : null;
        const quantity = row.quantity ? parseInt(row.quantity) : null;

        // Throw error if any required numeric fields are invalid
        if (!itemId || !componentId || !quantity) {
          throw new Error("All required fields must be filled out");
        }

        return {
          item_id: itemId,
          component_id: componentId,
          quantity: quantity,
          created_by: row.created_by?.trim() || "user1",
          last_updated_by: row.last_updated_by?.trim() || "user1",
        };
      });

      await onUpload(preparedData);
      setFile(null);
      setCsvData([]);
      setErrors([]);
    } catch (error) {
      setErrors([Array.isArray(error) ? error : [error.message]]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px] max-h-[80vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="mb-2">
            Bulk Upload Components
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>

          {csvData.length > 0 && (
            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Item (Sell)</TableHead>
                    <TableHead>Component (Purchase)</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>{rowIndex + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={row.item_id?.toString() || ""}
                          onValueChange={(value) =>
                            handleCellChange(
                              rowIndex,
                              "item_id",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {sellItems.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()} // Ensure we're using strings for value
                              >
                                {item.internal_item_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.component_id?.toString() || ""}
                          onValueChange={(value) =>
                            handleCellChange(
                              rowIndex,
                              "component_id",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select component" />
                          </SelectTrigger>
                          <SelectContent>
                            {purchaseItems.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.internal_item_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          value={row.quantity}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.created_by}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              "created_by",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.last_updated_by}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              "last_updated_by",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={
              !csvData.length || uploading || errors.length > 0
            }
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BulkUpload;

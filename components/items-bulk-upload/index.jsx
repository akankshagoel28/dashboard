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
import * as XLSX from "xlsx";

const ITEM_TYPES = [
  { value: "sell", label: "Sell" },
  { value: "purchase", label: "Purchase" },
  { value: "component", label: "Component" },
];

const UOM_OPTIONS = [
  { value: "Nos", label: "Numbers (NOS)" },
  { value: "Kgs", label: "Kilograms (KGS)" },
];

const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

function ItemsBulkUpload({ onUpload, existingItems }) {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const templateFields = [
    "internal_item_name",
    "tenant_id",
    "item_description",
    "uom",
    "type",
    "max_buffer",
    "min_buffer",
    "customer_item_name",
    "drawing_revision_number",
    "drawing_revision_date",
    "avg_weight_needed",
    "scrap_type",
    "shelf_floor_alternate_name",
    "created_by",
    "last_updated_by",
  ];

  const downloadTemplate = () => {
    const csv = Papa.unparse([templateFields]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "items_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    try {
      let fileData;
      if (selectedFile.name.endsWith(".xlsx")) {
        fileData = await parseExcelFile(selectedFile);
      } else if (selectedFile.name.endsWith(".csv")) {
        fileData = await new Promise((resolve, reject) => {
          Papa.parse(selectedFile, {
            header: true,
            complete: (results) => resolve(results.data),
            error: reject,
          });
        });
      } else {
        setErrors(["Please upload a .csv or .xlsx file"]);
        return;
      }

      const initializedData = fileData
        .filter((row) =>
          Object.values(row).some((value) => value !== "")
        )
        .map((row) => ({
          internal_item_name: row.internal_item_name || "",
          tenant_id: row.tenant_id || "",
          item_description: row.item_description || "",
          uom: row.uom || "",
          type: row.type || "",
          max_buffer: row.max_buffer || "0",
          min_buffer: row.min_buffer || "0",
          customer_item_name: row.customer_item_name || "",
          drawing_revision_number: row.drawing_revision_number || "0",
          drawing_revision_date: row.drawing_revision_date || "",
          avg_weight_needed:
            (row.avg_weight_needed || "false").toLowerCase() ===
            "true",
          scrap_type: row.scrap_type || "",
          shelf_floor_alternate_name:
            row.shelf_floor_alternate_name || "",
          created_by: row.created_by || "user1",
          last_updated_by: row.last_updated_by || "user1",
        }));

      setCsvData(initializedData);
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const validateData = (data) => {
    const errors = [];

    data.forEach((row, index) => {
      const rowNum = index + 1;

      // Validate required fields
      if (!row.internal_item_name?.trim()) {
        errors.push(`Row ${rowNum}: Internal item name is required`);
      }

      // Check for duplicate internal_item_name + tenant combination
      const isDuplicate = existingItems?.some(
        (item) =>
          item.internal_item_name === row.internal_item_name &&
          item.tenant_id.toString() === row.tenant_id
      );
      if (isDuplicate) {
        errors.push(
          `Row ${rowNum}: Item "${row.internal_item_name}" already exists for tenant ${row.tenant_id}`
        );
      }

      // Validate tenant_id
      if (!row.tenant_id?.trim()) {
        errors.push(`Row ${rowNum}: Tenant ID is required`);
      }

      // Validate type
      if (!row.type?.trim()) {
        errors.push(`Row ${rowNum}: Type is required`);
      } else if (
        !["sell", "purchase", "component"].includes(row.type)
      ) {
        errors.push(
          `Row ${rowNum}: Invalid type. Must be 'sell', 'purchase', or 'component'`
        );
      }

      // Validate scrap_type for sell items
      if (row.type === "sell" && !row.scrap_type?.trim()) {
        errors.push(
          `Row ${rowNum}: Scrap type is required for sell items`
        );
      }

      // Validate min_buffer for sell and purchase items
      if (["sell", "purchase"].includes(row.type)) {
        if (!row.min_buffer && row.min_buffer !== "0") {
          errors.push(
            `Row ${rowNum}: Min buffer is required for sell and purchase items`
          );
        }
      }

      // Validate buffer values
      const maxBuffer = parseInt(row.max_buffer || "0");
      const minBuffer = parseInt(row.min_buffer || "0");

      if (isNaN(maxBuffer) || isNaN(minBuffer)) {
        errors.push(
          `Row ${rowNum}: Buffer values must be valid numbers`
        );
      } else if (maxBuffer < minBuffer) {
        errors.push(
          `Row ${rowNum}: Max buffer must be greater than or equal to min buffer`
        );
      }

      // Validate UOM
      if (!row.uom?.trim()) {
        errors.push(`Row ${rowNum}: UOM is required`);
      } else if (
        !UOM_OPTIONS.some((option) => option.value === row.uom)
      ) {
        errors.push(`Row ${rowNum}: Invalid UOM value`);
      }
    });

    return errors;
  };

  const handleCellChange = (rowIndex, field, value) => {
    const updatedData = [...csvData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: value,
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
      const preparedData = csvData.map((row) => ({
        internal_item_name: row.internal_item_name,
        tenant_id: parseInt(row.tenant_id),
        item_description: row.item_description || "",
        uom: row.uom,
        type: row.type,
        max_buffer: parseInt(row.max_buffer || "0"),
        min_buffer: parseInt(row.min_buffer || "0"),
        customer_item_name: row.customer_item_name || "",
        is_deleted: false,
        additional_attributes: {
          drawing_revision_number: parseInt(
            row.drawing_revision_number || "0"
          ),
          drawing_revision_date: row.drawing_revision_date || "",
          avg_weight_needed: row.avg_weight_needed,
          scrap_type: row.scrap_type || "",
          shelf_floor_alternate_name:
            row.shelf_floor_alternate_name || "",
        },
        created_by: row.created_by || "user1",
        last_updated_by: row.last_updated_by || "user1",
      }));

      await onUpload(preparedData);
      setFile(null);
      setCsvData([]);
      setErrors([]);
    } catch (error) {
      setErrors([error.message]);
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
      <DialogContent
        className={`p-4 ${
          csvData.length > 0
            ? "w-11/12 max-w-[90vw] h-[90vh]"
            : "max-w-[500px]"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="mb-2">
            Bulk Upload Items
          </DialogTitle>
        </DialogHeader>

        <div
          className={`flex flex-col ${
            csvData.length > 0 ? "h-[calc(100%-6rem)]" : ""
          } gap-4`}
        >
          <div className="flex gap-4 shrink-0">
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <div className="flex-1">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>
          {csvData.length > 0 && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Internal Name</TableHead>
                      <TableHead>Tenant ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Min Buffer</TableHead>
                      <TableHead>Max Buffer</TableHead>
                      <TableHead>Avg Weight Needed</TableHead>
                      <TableHead>Scrap Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>{rowIndex + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={row.internal_item_name}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                "internal_item_name",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={row.tenant_id}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                "tenant_id",
                                e.target.value
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.type}
                            onValueChange={(value) =>
                              handleCellChange(
                                rowIndex,
                                "type",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ITEM_TYPES.map((type) => (
                                <SelectItem
                                  key={type.value}
                                  value={type.value}
                                >
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.uom}
                            onValueChange={(value) =>
                              handleCellChange(rowIndex, "uom", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select UoM" />
                            </SelectTrigger>
                            <SelectContent>
                              {UOM_OPTIONS.map((uom) => (
                                <SelectItem
                                  key={uom.value}
                                  value={uom.value}
                                >
                                  {uom.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={row.min_buffer}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                "min_buffer",
                                e.target.value
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={row.max_buffer}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                "max_buffer",
                                e.target.value
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              row.avg_weight_needed ? "true" : "false"
                            }
                            onValueChange={(value) =>
                              handleCellChange(
                                rowIndex,
                                "avg_weight_needed",
                                value === "true"
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {YES_NO_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.scrap_type}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                "scrap_type",
                                e.target.value
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {errors.length > 0 && (
            <div className="shrink-0">
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
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={
              !csvData.length || uploading || errors.length > 0
            }
            className="w-full shrink-0"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ItemsBulkUpload;

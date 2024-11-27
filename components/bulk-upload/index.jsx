// components/bulk-upload/index.jsx
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
import Papa from "papaparse";

function BulkUpload({ onUpload, templateFields }) {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    }
  };

  const validateData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
      templateFields.forEach((field) => {
        if (!row[field]) {
          errors.push(`Row ${index + 1}: Missing ${field}`);
        }
      });
    });
    return errors;
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validationErrors = validateData(results.data);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setUploading(false);
          return;
        }

        try {
          await onUpload(results.data);
          setFile(null);
          setErrors([]);
        } catch (error) {
          setErrors([error.message]);
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setErrors([error.message]);
        setUploading(false);
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle className="mb-2">
            Bulk Upload Components
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download Template
          </Button>

          <div className="space-y-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              Upload a CSV file with the required fields
            </p>
          </div>

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
            disabled={!file || uploading}
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

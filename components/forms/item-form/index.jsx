import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ITEM_TYPES = [
  { value: "sell", label: "Sell" },
  { value: "purchase", label: "Purchase" },
  { value: "component", label: "Component" },
];

const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const UOM_OPTIONS = [
  { value: "Nos", label: "Numbers (NOS)" },
  { value: "Kgs", label: "Kilograms (KGS)" },
];
function ItemForm({ onSubmit, editData, existingItems }) {
  const defaultValues = {
    internal_item_name: editData?.internal_item_name || "",
    tenant_id: editData?.tenant_id?.toString() || "",
    item_description: editData?.item_description || "",
    uom: editData?.uom || "",
    type: editData?.type || "",
    max_buffer: editData?.max_buffer?.toString() || "0",
    min_buffer: editData?.min_buffer?.toString() || "0",
    customer_item_name: editData?.customer_item_name || "",
    drawing_revision_number:
      editData?.additional_attributes?.drawing_revision_number?.toString() ||
      "0",
    drawing_revision_date:
      editData?.additional_attributes?.drawing_revision_date || "",
    avg_weight_needed:
      editData?.additional_attributes?.avg_weight_needed || false, // Changed to boolean
    scrap_type: editData?.additional_attributes?.scrap_type || "",
    shelf_floor_alternate_name:
      editData?.additional_attributes?.shelf_floor_alternate_name ||
      "",
  };

  const form = useForm({
    defaultValues,
    mode: "onChange",
  });

  const selectedType = form.watch("type") || "";
  const maxBuffer = form.watch("max_buffer") || "0";
  const minBuffer = form.watch("min_buffer") || "0";

  useEffect(() => {
    const maxVal = parseInt(maxBuffer || "0");
    const minVal = parseInt(minBuffer || "0");
    if (maxVal < minVal) {
      form.setError("max_buffer", {
        type: "validation",
        message:
          "Max buffer must be greater than or equal to min buffer",
      });
    } else {
      form.clearErrors("max_buffer");
    }
  }, [maxBuffer, minBuffer, form]);

  const handleSubmit = async (data) => {
    form.clearErrors();
    const errors = [];

    const isDuplicate = existingItems?.some(
      (item) =>
        item.internal_item_name === data.internal_item_name &&
        item.tenant_id.toString() === data.tenant_id &&
        item.id !== editData?.id
    );

    if (isDuplicate) {
      errors.push(
        "This internal item name already exists for this tenant"
      );
    }

    if (selectedType === "sell" && !data.scrap_type?.trim()) {
      errors.push("Scrap type is required for sell items");
    }

    if (["sell", "purchase"].includes(selectedType)) {
      if (!data.min_buffer && data.min_buffer !== "0") {
        errors.push(
          "Min buffer is required for sell and purchase items"
        );
      }
    }

    const maxBufferNum = parseInt(data.max_buffer || "0");
    const minBufferNum = parseInt(data.min_buffer || "0");

    if (maxBufferNum < minBufferNum) {
      errors.push(
        "Max buffer must be greater than or equal to min buffer"
      );
    }

    if (errors.length > 0) {
      form.setError("root", {
        type: "validation",
        message: errors.join(", "),
      });
      return;
    }

    try {
      const formattedData = {
        internal_item_name: data.internal_item_name,
        tenant_id: parseInt(data.tenant_id || "0"),
        item_description: data.item_description || "",
        uom: data.uom || "",
        created_by: "user1",
        last_updated_by: "user1",
        type: data.type || "",
        max_buffer: parseInt(data.max_buffer || "0"),
        min_buffer: parseInt(data.min_buffer || "0"),
        customer_item_name: data.customer_item_name || "",
        is_deleted: false,
        additional_attributes: {
          drawing_revision_number: parseInt(
            data.drawing_revision_number || "0"
          ),
          drawing_revision_date: data.drawing_revision_date || "",
          avg_weight_needed: data.avg_weight_needed, // Now just passing the boolean value
          scrap_type: data.scrap_type || "",
          shelf_floor_alternate_name:
            data.shelf_floor_alternate_name || "",
        },
      };

      if (editData?.id) {
        formattedData.id = editData.id;
      }

      await onSubmit(formattedData);
    } catch (error) {
      form.setError("root", {
        type: "backend",
        message:
          error.message || "An error occurred while saving the item",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 py-4"
      >
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="internal_item_name"
          rules={{ required: "Internal Item Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Item Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter item name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenant_id"
          rules={{ required: "Tenant ID is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant ID *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter tenant ID"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="item_description"
          rules={{ required: "Item description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Description *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter item description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          rules={{ required: "Type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ITEM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {["sell", "purchase"].includes(selectedType) && (
          <FormField
            control={form.control}
            name="scrap_type"
            rules={{
              required:
                selectedType === "sell"
                  ? "Scrap type is required for sell items"
                  : false,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Scrap Type {selectedType === "sell" ? "*" : ""}
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter scrap type" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="max_buffer"
            rules={{
              validate: {
                minBuffer: (value) => {
                  const max = parseInt(value || "0");
                  const min = parseInt(minBuffer || "0");
                  return (
                    max >= min ||
                    "Max buffer must be greater than or equal to min buffer"
                  );
                },
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Buffer</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Enter max buffer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_buffer"
            rules={{
              validate: {
                required: (value) => {
                  if (["sell", "purchase"].includes(selectedType)) {
                    return (
                      (value !== undefined && value !== "") ||
                      "Min buffer is required for sell and purchase items"
                    );
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Min Buffer{" "}
                  {["sell", "purchase"].includes(selectedType)
                    ? "*"
                    : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Enter min buffer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customer_item_name"
          rules={{ required: "Customer item name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Item Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter customer item name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="uom"
          rules={{ required: "UoM is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UOM_OPTIONS.map((uom) => (
                    <SelectItem key={uom.value} value={uom.value}>
                      {uom.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avg_weight_needed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Average Weight Needed</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "true")
                }
                value={field.value ? "true" : "false"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                </FormControl>
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
              <FormDescription>
                Select if average weight calculation is needed
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="drawing_revision_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drawing Revision Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Enter revision number"
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drawing_revision_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drawing Revision Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormDescription>Optional</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shelf_floor_alternate_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shelf/Floor Alternate Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter shelf/floor name"
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
            </FormItem>
          )}
        />

        <div className="sticky bottom-0 pt-4 bg-white border-t">
          <Button type="submit" className="w-full">
            {editData ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ItemForm;

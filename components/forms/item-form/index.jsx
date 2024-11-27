import React from "react";
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
];

const UOM_OPTIONS = [
  { value: "Nos", label: "Numbers (NOS)" },
  { value: "Kgs", label: "Kilograms (KGS)" },
];

// components/forms/item-form/index.jsx
function ItemForm({ onSubmit, editData }) {
  const defaultValues = editData
    ? {
        internal_item_name: editData.internal_item_name || "",
        tenant_id: editData.tenant_id?.toString() || "",
        item_description: editData.item_description || "",
        uom: editData.uom || "",
        type: editData.type || "",
        max_buffer: editData.max_buffer?.toString() || "0",
        min_buffer: editData.min_buffer?.toString() || "0",
        customer_item_name: editData.customer_item_name || "",
        drawing_revision_number:
          editData.additional_attributes?.drawing_revision_number?.toString() ||
          "",
        drawing_revision_date:
          editData.additional_attributes?.drawing_revision_date || "",
        avg_weight_needed:
          editData.additional_attributes?.avg_weight_needed?.toString() ||
          "",
        scrap_type: editData.additional_attributes?.scrap_type || "",
        shelf_floor_alternate_name:
          editData.additional_attributes
            ?.shelf_floor_alternate_name || "",
      }
    : {
        internal_item_name: "",
        tenant_id: "",
        item_description: "",
        uom: "",
        type: "",
        max_buffer: "0",
        min_buffer: "0",
        customer_item_name: "",
        drawing_revision_number: "",
        drawing_revision_date: "",
        avg_weight_needed: "",
        scrap_type: "",
        shelf_floor_alternate_name: "",
      };

  const form = useForm({
    defaultValues,
  });

  const selectedType = form.watch("type");

  const handleSubmit = async (data) => {
    // Validate required fields
    if (!data.internal_item_name || !data.tenant_id) {
      form.setError("root", {
        message: "Please fill in all required fields",
      });
      return;
    }

    // Validate scrap_type for sell/purchase types
    if (
      ["sell", "purchase"].includes(data.type) &&
      !data.scrap_type
    ) {
      form.setError("root", {
        message: "Scrap type is required for sell/purchase items",
      });
      return;
    }

    // Format data for API
    const formattedData = {
      internal_item_name: data.internal_item_name,
      tenant_id: parseInt(data.tenant_id),
      item_description: data.item_description || "", // Empty string instead of null
      uom: data.uom || "",
      created_by: "user1",
      last_updated_by: "user1",
      type: data.type || "",
      max_buffer: parseInt(data.max_buffer || "0"),
      min_buffer: parseInt(data.min_buffer || "0"),
      customer_item_name: data.customer_item_name || "",
      is_deleted: false,
      additional_attributes: {
        drawing_revision_number: data.drawing_revision_number
          ? parseInt(data.drawing_revision_number)
          : 0,
        drawing_revision_date: data.drawing_revision_date || "",
        avg_weight_needed: data.avg_weight_needed
          ? parseFloat(data.avg_weight_needed)
          : 0,
        scrap_type: data.scrap_type || "",
        shelf_floor_alternate_name:
          data.shelf_floor_alternate_name || "",
      },
    };

    // If editing, preserve the id
    if (editData?.id) {
      formattedData.id = editData.id;
    }

    onSubmit(formattedData);
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
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
              <FormDescription>
                Optional - Status will be pending if not filled
              </FormDescription>
            </FormItem>
          )}
        />

        {["sell", "purchase"].includes(selectedType) && (
          <FormField
            control={form.control}
            name="scrap_type"
            rules={{
              required:
                "Scrap type is required for sell/purchase items",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scrap Type *</FormLabel>
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
            rules={{ required: "Max buffer is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Buffer *</FormLabel>
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
            rules={{ required: "Min buffer is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Buffer *</FormLabel>
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

        {/* Additional optional fields */}
        <FormField
          control={form.control}
          name="uom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
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
              <FormDescription>
                Optional - Status will be pending if not filled
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avg_weight_needed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Average Weight Needed</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="Enter average weight"
                />
              </FormControl>
              <FormDescription>
                Optional - Status will be pending if not filled
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

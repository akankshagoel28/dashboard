// components/forms/process-form/index.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useItems } from "@/hooks/use-items";

const PROCESS_NAMES = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "assembly", label: "Assembly" },
  { value: "quality_inspection", label: "Quality Inspection" },
  { value: "packaging", label: "Packaging" },
  { value: "machining", label: "Machining" },
  { value: "welding", label: "Welding" },
  { value: "painting", label: "Painting" },
  { value: "heat_treatment", label: "Heat Treatment" },
  { value: "surface_treatment", label: "Surface Treatment" },
  { value: "testing", label: "Testing" },
];

const FACTORY_IDS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Factory ${i + 1}`,
}));

function ProcessForm({ onSubmit, initialData }) {
  const { items, fetchItems } = useItems();
  const [tenantOptions, setTenantOptions] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    console.log("Raw Items:", items);
    if (items && items.length > 0) {
      const tenantIds = items.map((item) => item.tenant_id);
      console.log("Tenant IDs extracted:", tenantIds);

      const uniqueTenants = [
        ...new Set(items.map((item) => item.tenant_id)),
      ];
      console.log("Unique Tenant IDs:", uniqueTenants);

      const formattedTenants = uniqueTenants
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((id) => ({
          value: id.toString(),
          label: `Tenant ${id}`,
        }));

      setTenantOptions(formattedTenants);
    }
  }, [items]);

  const form = useForm({
    defaultValues: initialData
      ? {
          process_name: initialData.process_name || "",
          factory_id: initialData.factory_id?.toString() || "",
          tenant_id: initialData.tenant_id?.toString() || "",
          type: initialData.type || "",
        }
      : {
          process_name: "",
          factory_id: "",
          tenant_id: "",
          type: "",
        },
  });

  const handleSubmit = async (data) => {
    const formattedData = {
      ...data,
      factory_id: parseInt(data.factory_id),
      tenant_id: parseInt(data.tenant_id),
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="process_name"
          rules={{ required: "Process name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Name *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select process name" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROCESS_NAMES.map((process) => (
                    <SelectItem
                      key={process.value}
                      value={process.value}
                    >
                      {process.label}
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
          name="tenant_id"
          rules={{ required: "Tenant ID is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant ID *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant ID" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tenantOptions.map((tenant) => (
                    <SelectItem
                      key={tenant.value}
                      value={tenant.value}
                    >
                      {tenant.label}
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
          name="type"
          rules={{ required: "Process type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Type *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter process type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="factory_id"
          rules={{ required: "Factory ID is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Factory ID *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select factory ID" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FACTORY_IDS.map((factory) => (
                    <SelectItem
                      key={factory.value}
                      value={factory.value}
                    >
                      {factory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Process" : "Create Process"}
        </Button>
      </form>
    </Form>
  );
}

export default ProcessForm;

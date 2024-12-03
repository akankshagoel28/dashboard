import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProcessStepForm({
  onSubmit,
  initialData,
  selectedItemId,
  processes,
}) {
  const form = useForm({
    defaultValues: initialData
      ? {
          process_id: initialData.process_id?.toString() || "",
          sequence: initialData.sequence?.toString() || "",
          process_description: initialData.process_description || "",
        }
      : {
          process_id: "",
          sequence: "",
          process_description: "",
        },
  });

  const handleSubmit = async (data) => {
    const formattedData = {
      item_id: parseInt(selectedItemId),
      process_id: parseInt(data.process_id),
      sequence: parseInt(data.sequence),
      created_by: "user1",
      last_updated_by: "user1",
    };

    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="process_id"
          rules={{ required: "Process is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {processes.map((process) => (
                    <SelectItem
                      key={process.id}
                      value={process.id.toString()}
                    >
                      {process.process_name}
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
          name="sequence"
          rules={{
            required: "Sequence is required",
            min: {
              value: 1,
              message: "Sequence must be greater than 0",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sequence *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="Enter sequence number"
                />
              </FormControl>
              <FormDescription>
                Sequence number must be consecutive with no gaps
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Step" : "Create Step"}
        </Button>
      </form>
    </Form>
  );
}

export default ProcessStepForm;

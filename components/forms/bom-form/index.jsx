// components/forms/bom-form/index.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const UOM_OPTIONS = [
  { value: "Nos", label: "Numbers (NOS)" },
  { value: "Kgs", label: "Kilograms (KGS)" },
];

function BomForm({ onSubmit, editData, items, selectedItemId }) {
  const [open, setOpen] = useState(false);
  const [newComponentDialog, setNewComponentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm({
    defaultValues: editData
      ? {
          component_id: editData.component_id?.toString(),
          quantity: editData.quantity?.toString(),
        }
      : {
          component_id: "",
          quantity: "",
        },
  });

  const newComponentForm = useForm({
    defaultValues: {
      internal_item_name: "",
      uom: "",
    },
  });

  const handleSubmit = async (data) => {
    onSubmit({
      ...data,
      item_id: selectedItemId,
    });
  };

  const handleNewComponent = async (formData) => {
    try {
      await onSubmit({
        is_new_component: true,
        component_data: {
          internal_item_name: formData.internal_item_name,
          tenant_id: "1",
          item_description: "New component",
          uom: formData.uom,
          type: "component",
          max_buffer: 0,
          min_buffer: 0,
          customer_item_name: formData.internal_item_name,
          is_deleted: false,
          additional_attributes: {
            avg_weight_needed: 0,
            scrap_type: "",
          },
        },
        quantity: form.getValues("quantity") || 1,
      });

      setNewComponentDialog(false);
      setOpen(false);
      newComponentForm.reset();
    } catch (error) {
      console.error("Error creating component:", error);
    }
  };

  return (
    <div className="px-1 py-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="component_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base">
                    Component *
                  </FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between h-10",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? items.find(
                                (item) =>
                                  item.id.toString() === field.value
                              )?.internal_item_name || "New Component"
                            : "Select component"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[400px] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search components..."
                          onValueChange={setSearchTerm}
                          className="h-9"
                        />
                        <CommandList>
                          <ScrollArea className="h-[200px]">
                            <CommandEmpty>
                              No component found.
                            </CommandEmpty>
                            <CommandGroup heading="Existing Components">
                              {items
                                .filter((item) =>
                                  item.internal_item_name
                                    .toLowerCase()
                                    .includes(
                                      searchTerm.toLowerCase() &&
                                        item.type == "purchase"
                                    )
                                )
                                .map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.internal_item_name}
                                    onSelect={() => {
                                      form.setValue(
                                        "component_id",
                                        item.id.toString()
                                      );
                                      setOpen(false);
                                    }}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center">
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          item.id.toString() ===
                                            field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span>
                                        {item.internal_item_name}
                                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {item.uom}
                                    </span>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator className="my-1" />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setNewComponentDialog(true);
                                  setOpen(false);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add new component
                              </CommandItem>
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select an existing component or create a new one
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              rules={{
                required: "Quantity is required",
                min: {
                  value: 0.01,
                  message: "Quantity must be greater than 0",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    Quantity *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Enter quantity"
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the required quantity for this component
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            {editData ? "Update BOM Entry" : "Create BOM Entry"}
          </Button>
        </form>
      </Form>

      <Dialog
        open={newComponentDialog}
        onOpenChange={setNewComponentDialog}
      >
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
            <DialogDescription>
              Create a new component to add to your Bill of Materials.
            </DialogDescription>
          </DialogHeader>
          <Form {...newComponentForm}>
            <form
              onSubmit={newComponentForm.handleSubmit(
                handleNewComponent
              )}
              className="space-y-4"
            >
              <FormField
                control={newComponentForm.control}
                name="internal_item_name"
                rules={{ required: "Component name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Component Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter component name"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newComponentForm.control}
                name="uom"
                rules={{ required: "UoM is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Unit of Measurement *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select UoM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UOM_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-6">
                Add Component
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BomForm;

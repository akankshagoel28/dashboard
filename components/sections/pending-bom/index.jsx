import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function PendingBom({ items, bomItems, onItemSelect }) {
  const [activeTab, setActiveTab] = useState("sell");
  const [searchTerm, setSearchTerm] = useState("");

  // Get all sell items that don't have any BOM entries
  const sellItemsWithoutBom = items
    .filter((item) => item.type === "sell")
    .filter(
      (item) => !bomItems.some((bom) => bom.item_id === item.id)
    )
    .filter(
      (item) =>
        item.internal_item_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.item_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  // Get all purchase items that aren't used in any BOM
  const unusedPurchaseItems = items
    .filter((item) => item.type === "purchase")
    .filter(
      (item) => !bomItems.some((bom) => bom.component_id === item.id)
    )
    .filter(
      (item) =>
        item.internal_item_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.item_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending BOM Items</CardTitle>
        <CardDescription>
          Review items requiring BOM configuration and unused
          components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 pb-24 md:pb-2">
            <TabsTrigger value="sell" className="text-wrap ">
              Sell Items Without BOM
              {sellItemsWithoutBom.length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                  {sellItemsWithoutBom.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="purchase" className="text-wrap ">
              Unused Purchase Items
              {unusedPurchaseItems.length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                  {unusedPurchaseItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sell">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Buffers (Min/Max)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellItemsWithoutBom.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground h-32"
                      >
                        All sell items have BOM entries
                      </TableCell>
                    </TableRow>
                  ) : (
                    sellItemsWithoutBom.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.internal_item_name}
                        </TableCell>
                        <TableCell>{item.item_description}</TableCell>
                        <TableCell>{item.uom}</TableCell>
                        <TableCell>
                          {item.min_buffer} / {item.max_buffer}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="purchase">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Buffers (Min/Max)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unusedPurchaseItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground h-32"
                      >
                        All purchase items are being used in BOMs
                      </TableCell>
                    </TableRow>
                  ) : (
                    unusedPurchaseItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.internal_item_name}
                        </TableCell>
                        <TableCell>{item.item_description}</TableCell>
                        <TableCell>{item.uom}</TableCell>
                        <TableCell>
                          {item.min_buffer} / {item.max_buffer}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PendingBom;

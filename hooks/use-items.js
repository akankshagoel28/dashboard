// hooks/use-items.js
import { useState, useCallback } from "react";

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api-assignment.inveesync.in/items"
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch items");

      // Sort items by type and name
      const sortedData = [...data].sort((a, b) => {
        if (a.type === b.type) {
          return a.internal_item_name.localeCompare(
            b.internal_item_name
          );
        }
        return a.type === "component" ? 1 : -1;
      });

      setItems(sortedData);
      return { success: true, data: sortedData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(async (itemData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api-assignment.inveesync.in/items",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to add item");

      setItems((prev) =>
        [...prev, data].sort((a, b) =>
          a.internal_item_name.localeCompare(b.internal_item_name)
        )
      );

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  const getSellItems = useCallback(() => {
    return items.filter((item) => item.type === "sell");
  }, [items]);

  const getComponentItems = useCallback(() => {
    return items.filter((item) => item.type === "component");
  }, [items]);

  const updateItem = useCallback(async (id, itemData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api-assignment.inveesync.in/items/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update item");
      setItems((prev) =>
        prev.map((item) => (item.id === id ? data : item))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteItem = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        // First, get the item details to check its type
        const itemToDelete = items.find((item) => item.id === id);

        if (itemToDelete?.type === "sell") {
          // For sell type items, check BOM relationships
          const bomResponse = await fetch(
            `https://api-assignment.inveesync.in/bom?item_id=${id}`
          );
          const bomData = await bomResponse.json();

          if (Array.isArray(bomData) && bomData.length > 0) {
            throw new Error(
              "Cannot delete this item as it has associated BOM entries"
            );
          }
        }

        // If we reach here, it's safe to delete the item
        const response = await fetch(
          `https://api-assignment.inveesync.in/items/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete item");
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [items]
  );

  return {
    items,
    isLoading,
    error,
    addItem,
    getSellItems,
    getComponentItems,
    updateItem,
    deleteItem,
    fetchItems,
  };
};

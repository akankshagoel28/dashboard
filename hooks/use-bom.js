import { useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";

export const useBom = () => {
  const [bomItems, setBomItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBomByItemId = useCallback(async (itemId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/bom?item_id=${itemId}`
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch BOM");
      setBomItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message);
      setBomItems([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBom = useCallback(async (bomData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bomData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add BOM item");
      setBomItems((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBom = useCallback(async (id, bomData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bom/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bomData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update BOM item");
      setBomItems((prev) =>
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

  const deleteBom = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bom/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete BOM item");
      setBomItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bomItems,
    isLoading,
    error,
    fetchBomByItemId,
    addBom,
    updateBom,
    deleteBom,
  };
};

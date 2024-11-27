// hooks/use-processes.js
import { useState, useCallback } from "react";

export const useProcesses = () => {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProcesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api-assignment.inveesync.in/process"
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch processes");
      setProcesses(Array.isArray(data) ? data : [data]);
      return data;
    } catch (err) {
      setError(err.message);
      setProcesses([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProcess = useCallback(
    async (processData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://api-assignment.inveesync.in/process",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...processData,
              created_by: "user1",
              last_updated_by: "user1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to add process");
        setProcesses((prev) => [...prev, data]);
        await fetchProcesses();
        return { success: true, data };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProcesses]
  );

  const updateProcess = useCallback(
    async (id, processData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api-assignment.inveesync.in/process/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...processData,
              last_updated_by: "user1",
              updatedAt: new Date().toISOString(),
            }),
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to update process");
        await fetchProcesses(); // Refresh the list after updating
        return { success: true, data };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProcesses]
  );

  const deleteProcess = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api-assignment.inveesync.in/process/${id}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to delete process");
        await fetchProcesses();
        return { success: true, data };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProcesses]
  );

  return {
    processes,
    isLoading,
    error,
    fetchProcesses,
    addProcess,
    updateProcess,
    deleteProcess,
  };
};

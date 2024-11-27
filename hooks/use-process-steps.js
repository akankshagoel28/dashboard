// hooks/use-process-steps.js
import { useState, useCallback } from "react";

export const useProcessSteps = () => {
  const [processSteps, setProcessSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProcessSteps = useCallback(async (itemId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api-assignment.inveesync.in/process-step?item_id=${itemId}`
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Failed to fetch process steps"
        );
      setProcessSteps(Array.isArray(data) ? data : [data]);
      return data;
    } catch (err) {
      setError(err.message);
      setProcessSteps([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProcessStep = useCallback(async (stepData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api-assignment.inveesync.in/process-step",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...stepData,
            created_by: "user1",
            last_updated_by: "user1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add process step");
      setProcessSteps((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProcessStep = useCallback(async (id, stepData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api-assignment.inveesync.in/process-step/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...stepData,
            last_updated_by: "user1",
            updatedAt: new Date().toISOString(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Failed to update process step"
        );
      setProcessSteps((prev) =>
        prev.map((step) => (step.id === id ? data : step))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProcessStep = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api-assignment.inveesync.in/process-step/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Failed to delete process step"
        );
      setProcessSteps((prev) =>
        prev.filter((step) => step.id !== id)
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    processSteps,
    isLoading,
    error,
    fetchProcessSteps,
    addProcessStep,
    updateProcessStep,
    deleteProcessStep,
  };
};

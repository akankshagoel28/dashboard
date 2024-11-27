import { API_BASE_URL } from "./config";

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "API request failed");
      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch data");
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "API request failed");
      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to post data");
    }
  },
};

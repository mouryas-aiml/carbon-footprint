// ─── useApi.js ───────────────────────────────────────────────────
// Custom hook for calling the CarbonSense Flask API.
// Base URL is configurable via REACT_APP_API_URL env variable.
import { useState, useCallback } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const call = useCallback(async (endpoint, method = 'GET', body = null) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}

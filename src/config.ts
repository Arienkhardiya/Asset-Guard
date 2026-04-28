/// <reference types="vite/client" />
// Configuration for API communication
// In production (Cloud Run), VITE_API_BASE should be empty for relative paths
export const API_BASE = import.meta.env.VITE_API_BASE || "";

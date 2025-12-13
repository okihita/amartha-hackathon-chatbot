// Centralized API configuration
// In production (Vercel), this points to Cloud Run backend
// In development, it's empty (uses Vite proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

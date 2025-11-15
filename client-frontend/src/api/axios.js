import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Public API for login, register, refresh
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This is CRITICAL for sending the refresh token cookie
});

// Private API instance (base for our interceptor hook)
export const privateApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
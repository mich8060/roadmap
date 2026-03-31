/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Public Railway (or other) API origin, no path, no trailing slash.
   * Example: https://roadmap-api-production.up.railway.app
   * Leave unset locally so requests use `/api/event-positions` (Vite proxy).
   */
  readonly VITE_EVENT_POSITIONS_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { apiFetch } from "./client";

export type HealthResponse = {
  ok: boolean;
  service?: string;
  timestamp?: string;
  devStore?: { usersLoaded: number; storeFile: string };
};

/** GET /api/health — comprobar que el backend Goi Web responde. */
export function getHealth() {
  return apiFetch<HealthResponse>("/health");
}

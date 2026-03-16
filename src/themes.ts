import type { Theme } from "./types.js";

export const themes: Record<string, Theme> = {
  dark: {
    border: "#444444",
    methodColors: {
      GET: "#4ade80", // green
      POST: "#60a5fa", // blue
      PUT: "#facc15", // yellow
      PATCH: "#fb923c", // orange
      DELETE: "#f87171", // red
      HEAD: "#a78bfa", // violet
      OPTIONS: "#94a3b8", // slate
    },
    statusColors: {
      success: "#4ade80",
      redirect: "#facc15",
      clientError: "#fb923c",
      serverError: "#f87171",
    },
    label: "#94a3b8",
    dim: "#555555",
    key: "#94a3b8",
    value: "#e2e8f0",
    time: "#a78bfa",
  },
  light: {
    border: "#cbd5e1",
    methodColors: {
      GET: "#16a34a",
      POST: "#2563eb",
      PUT: "#ca8a04",
      PATCH: "#ea580c",
      DELETE: "#dc2626",
      HEAD: "#7c3aed",
      OPTIONS: "#64748b",
    },
    statusColors: {
      success: "#16a34a",
      redirect: "#ca8a04",
      clientError: "#ea580c",
      serverError: "#dc2626",
    },
    label: "#64748b",
    dim: "#94a3b8",
    key: "#475569",
    value: "#1e293b",
    time: "#7c3aed",
  },
  minimal: {
    border: "#333333",
    methodColors: {
      GET: "#ffffff",
      POST: "#ffffff",
      PUT: "#ffffff",
      PATCH: "#ffffff",
      DELETE: "#ffffff",
      HEAD: "#ffffff",
      OPTIONS: "#ffffff",
    },
    statusColors: {
      success: "#ffffff",
      redirect: "#aaaaaa",
      clientError: "#aaaaaa",
      serverError: "#666666",
    },
    label: "#555555",
    dim: "#444444",
    key: "#666666",
    value: "#aaaaaa",
    time: "#666666",
  },
};

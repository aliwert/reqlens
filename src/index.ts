export { reqlens } from "./middleware.js";
export type {
  ReqLensOptions,
  LogEntry,
  RequestSnapshot,
  ResponseSnapshot,
} from "./types.js";

// Default export for convenient usage: import reqlens from 'reqlens'
export { reqlens as default } from "./middleware.js";

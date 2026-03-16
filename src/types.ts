export interface ReqLensOptions {
  /** Show request headers. Default: false */
  showHeaders?: boolean;

  /** Show request body. Default: true */
  showBody?: boolean;

  /** Show query string params. Default: true */
  showQuery?: boolean;

  /** Show response body (requires res.json override). Default: false */
  showResponse?: boolean;

  /** Paths to exclude from logging (supports * wildcard). Default: [] */
  exclude?: string[];

  /** Max characters to show for body/response. Default: 500 */
  maxBodyLength?: number;

  /** Headers to redact (shown as ***). Default: ['authorization', 'cookie', 'x-api-key'] */
  redactHeaders?: string[];

  /** Theme preset. Default: 'dark' */
  theme?: "dark" | "light" | "minimal";

  /** Custom label shown in the box header. Default: 'reqlens' */
  label?: string;

  /** Compact mode — single-line per request. Default: false */
  compact?: boolean;
}

export interface RequestSnapshot {
  id: string;
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  timestamp: Date;
  ip: string;
}

export interface ResponseSnapshot {
  statusCode: number;
  responseTime: number;
  contentLength: number | null;
}

export type LogEntry = RequestSnapshot & ResponseSnapshot;

export type Theme = {
  border: string;
  methodColors: Record<string, string>;
  statusColors: {
    success: string;
    redirect: string;
    clientError: string;
    serverError: string;
  };
  label: string;
  dim: string;
  key: string;
  value: string;
  time: string;
};

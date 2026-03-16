import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomBytes } from "crypto";
import type { ReqLensOptions, RequestSnapshot, LogEntry } from "./types.js";
import { formatFull, formatCompact } from "./formatter.js";

const DEFAULT_OPTIONS: Required<ReqLensOptions> = {
  showHeaders: false,
  showBody: true,
  showQuery: true,
  showResponse: false,
  exclude: [],
  maxBodyLength: 600,
  redactHeaders: ["authorization", "cookie", "x-api-key", "x-auth-token"],
  theme: "dark",
  label: "reqlens",
  compact: false,
};

function matchesExclude(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(path);
  });
}

function getIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
    return ip.trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export function reqlens(userOptions: ReqLensOptions = {}): RequestHandler {
  const opts: Required<ReqLensOptions> = {
    ...DEFAULT_OPTIONS,
    ...userOptions,
  };

  return function reqlensMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    // Skip excluded paths
    if (matchesExclude(req.path, opts.exclude)) {
      return next();
    }

    const start = process.hrtime.bigint();
    const id = randomBytes(4).toString("hex");

    const snapshot: RequestSnapshot = {
      id,
      method: req.method,
      path: req.path,
      query: req.query as Record<string, string | string[]>,
      headers: req.headers as Record<string, string | string[] | undefined>,
      body: req.body,
      timestamp: new Date(),
      ip: getIp(req),
    };

    // Hook into response finish
    res.on("finish", () => {
      const elapsedNs = process.hrtime.bigint() - start;
      const elapsedMs = Number(elapsedNs) / 1_000_000;

      const contentLengthHeader = res.getHeader("content-length");
      const contentLength =
        contentLengthHeader != null
          ? parseInt(String(contentLengthHeader), 10)
          : null;

      const entry: LogEntry = {
        ...snapshot,
        statusCode: res.statusCode,
        responseTime: elapsedMs,
        contentLength,
      };

      const output = opts.compact
        ? formatCompact(entry, opts)
        : formatFull(entry, opts);

      process.stdout.write(output + (opts.compact ? "\n" : ""));
    });

    next();
  };
}

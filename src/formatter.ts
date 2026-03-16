import chalk from "chalk";
import type { LogEntry, ReqLensOptions, Theme } from "./types.js";
import { themes } from "./themes.js";

// ── Helpers ────────────────────────────────────────────────────────────────

function terminalWidth(): number {
  return Math.min(process.stdout.columns || 80, 120);
}

function hex(color: string) {
  return chalk.hex(color);
}

function statusColor(code: number, theme: Theme): string {
  if (code >= 500) return theme.statusColors.serverError;
  if (code >= 400) return theme.statusColors.clientError;
  if (code >= 300) return theme.statusColors.redirect;
  return theme.statusColors.success;
}

function methodColor(method: string, theme: Theme): string {
  return theme.methodColors[method] ?? "#ffffff";
}

function formatTime(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}kB`;
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, "");
}

/**
 * FIX #1: truncate() must operate on plain text BEFORE colorizing.
 * Receiving an already-colored (ANSI-wrapped) string means str.length counts
 * escape bytes, not visible chars — the guard fires at the wrong point and
 * slice() can cut through an escape sequence, leaving the terminal stuck in
 * a color state.
 *
 * New signature: takes the raw value + a color function separately.
 * Truncation happens on plain text, then color is applied to the result.
 */
function truncate(
  raw: string,
  maxLen: number,
  colorFn: (s: string) => string,
): string {
  if (raw.length <= maxLen) return colorFn(raw);
  return (
    colorFn(raw.slice(0, maxLen)) +
    hex("#555555")(`… +${raw.length - maxLen} chars`)
  );
}

// ─── Box Drawing ─────────────────────────────────────────────────────────────

const BOX = {
  tl: "╭",
  tr: "╮",
  bl: "╰",
  br: "╯",
  h: "─",
  v: "│",
  ml: "├",
  mr: "┤",
};

function boxLine(content: string, width: number, borderColor: string): string {
  const inner = width - 2;
  const visible = stripAnsi(content);
  const pad = Math.max(0, inner - visible.length);
  return (
    hex(borderColor)(BOX.v) +
    content +
    " ".repeat(pad) +
    hex(borderColor)(BOX.v)
  );
}

function divider(width: number, borderColor: string, label?: string): string {
  if (!label) {
    return hex(borderColor)(BOX.ml + BOX.h.repeat(width - 2) + BOX.mr);
  }
  const line = BOX.h.repeat(2) + " " + label + " ";
  const remaining = BOX.h.repeat(
    Math.max(0, width - 2 - stripAnsi(line).length),
  );
  return hex(borderColor)(BOX.ml + line + remaining + BOX.mr);
}

function topBar(width: number, borderColor: string): string {
  return hex(borderColor)(BOX.tl + BOX.h.repeat(width - 2) + BOX.tr);
}

function bottomBar(width: number, borderColor: string): string {
  return hex(borderColor)(BOX.bl + BOX.h.repeat(width - 2) + BOX.br);
}

// ─── Compact formatter ────────────────────────────────────────────────────────

export function formatCompact(
  entry: LogEntry,
  opts: Required<ReqLensOptions>,
): string {
  const theme = themes[opts.theme];
  const mColor = methodColor(entry.method, theme);
  const sColor = statusColor(entry.statusCode, theme);

  const method = hex(mColor)(entry.method.padEnd(7));
  const status = hex(sColor)(String(entry.statusCode));
  const time = hex(theme.time)(formatTime(entry.responseTime).padStart(6));
  const path = hex(theme.value)(entry.path);
  const ts = hex(theme.dim)(entry.timestamp.toLocaleTimeString());

  return `  ${ts}  ${method} ${path}  ${status}  ${time}`;
}

// ─── Full box formatter ────────────────────────────────────────────────────────

export function formatFull(
  entry: LogEntry,
  opts: Required<ReqLensOptions>,
): string {
  const theme = themes[opts.theme];
  const width = Math.min(terminalWidth(), 110);
  const inner = width - 2;

  const mColor = methodColor(entry.method, theme);
  const sColor = statusColor(entry.statusCode, theme);

  const lines: string[] = [];
  const bc = theme.border;

  // pad() wraps content with one leading space inside the border
  const pad = (content: string) => boxLine(" " + content, width, bc);

  // contentWidth: usable chars inside pad() rows (inner minus the leading space)
  const contentWidth = inner - 1;

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  const labelStr = hex(theme.label)("◈ " + opts.label);
  const tsStr = hex(theme.dim)(entry.timestamp.toLocaleTimeString());
  const ipStr = hex(theme.dim)(entry.ip);
  const separator = hex(theme.dim)(" · ");

  const topLeft = " " + labelStr;
  const topRight = tsStr + separator + ipStr + " ";

  const topLeftLen = stripAnsi(topLeft).length;
  const topRightLen = stripAnsi(topRight).length;

  const gapNeeded = Math.max(1, inner - topLeftLen - topRightLen);
  const topContent = topLeft + " ".repeat(gapNeeded) + topRight;

  lines.push(topBar(width, bc));
  lines.push(hex(bc)(BOX.v) + topContent + hex(bc)(BOX.v));

  // ── METHOD + PATH + STATUS ────────────────────────────────────────────────
  lines.push(divider(width, bc));

  const methodStr = chalk.bold(hex(mColor)(entry.method.padEnd(8)));
  const statusStr = chalk.bold(hex(sColor)(String(entry.statusCode)));
  const timeStr = hex(theme.time)(formatTime(entry.responseTime));
  const sizeStr = hex(theme.dim)(formatBytes(entry.contentLength));

  const rightContent = statusStr + "  " + timeStr + "  " + sizeStr + " ";
  const rightLen = stripAnsi(rightContent).length;

  const availPath = contentWidth - 8 - rightLen;
  // FIX #1 applied: truncate raw path first, then color
  const pathStr = truncate(entry.path, availPath, hex(theme.value));

  const rowGap = " ".repeat(
    Math.max(
      1,
      contentWidth - 8 - entry.path.slice(0, availPath).length - rightLen,
    ),
  );

  lines.push(
    boxLine(" " + methodStr + pathStr + rowGap + rightContent, width, bc),
  );

  // ── QUERY PARAMS ──────────────────────────────────────────────────────────
  const queryKeys = Object.keys(entry.query);
  if (opts.showQuery && queryKeys.length > 0) {
    lines.push(divider(width, bc, hex(theme.dim)("query")));
    for (const [k, v] of Object.entries(entry.query)) {
      const rawVal = Array.isArray(v) ? v.join(", ") : String(v);
      const keyColWidth = Math.min(20, Math.floor((contentWidth - 1) / 3));
      const keyStr = hex(theme.key)(k.padEnd(keyColWidth));
      const valMaxLen = Math.max(20, contentWidth - keyColWidth - 1);
      // FIX #1 applied: pass raw value + color function separately
      const valStr = truncate(rawVal, valMaxLen, hex(theme.value));
      lines.push(pad(keyStr + " " + valStr));
    }
  }

  // ── HEADERS ───────────────────────────────────────────────────────────────
  if (opts.showHeaders) {
    const redacted = new Set(opts.redactHeaders.map((h) => h.toLowerCase()));
    const filteredHeaders = Object.entries(entry.headers).filter(
      ([k]) =>
        !["host", "connection", "content-length"].includes(k.toLowerCase()),
    );

    if (filteredHeaders.length > 0) {
      lines.push(divider(width, bc, hex(theme.dim)("headers")));
      for (const [k, v] of filteredHeaders) {
        const isRedacted = redacted.has(k.toLowerCase());
        const rawVal = isRedacted
          ? "••••••••"
          : Array.isArray(v)
            ? v.join(", ")
            : String(v ?? "");
        const keyColWidth = Math.min(28, Math.floor((contentWidth - 1) / 3));
        const keyStr = hex(theme.key)(k.toLowerCase().padEnd(keyColWidth));
        const valMaxLen = Math.max(20, contentWidth - keyColWidth - 1);
        // FIX #1 applied: truncate plain text, color after
        const valColor = isRedacted ? hex("#f87171") : hex(theme.value);
        const valStr = truncate(rawVal, valMaxLen, valColor);
        lines.push(pad(keyStr + " " + valStr));
      }
    }
  }

  // ── BODY ─────────────────────────────────────────────────────────────────
  if (opts.showBody && entry.body !== undefined && entry.body !== null) {
    const bodyStr =
      typeof entry.body === "string"
        ? entry.body
        : JSON.stringify(entry.body, null, 2);

    if (bodyStr && bodyStr !== "{}" && bodyStr !== "[]") {
      lines.push(divider(width, bc, hex(theme.dim)("body")));

      const bodyLines = bodyStr.split("\n");
      let charCount = 0;
      let truncated = false;

      for (const line of bodyLines) {
        if (charCount + line.length > opts.maxBodyLength) {
          truncated = true;
          break;
        }
        charCount += line.length;
        // Body lines: plain text sliced first, THEN colorized — already correct
        lines.push(pad(hex(theme.value)(line.substring(0, contentWidth - 1))));
      }

      if (truncated) {
        lines.push(
          pad(hex(theme.dim)(`  … truncated (${bodyStr.length} total chars)`)),
        );
      }
    }
  }

  // ── BOTTOM ────────────────────────────────────────────────────────────────
  lines.push(bottomBar(width, bc));
  lines.push("");

  return lines.join("\n");
}

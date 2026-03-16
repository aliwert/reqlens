# reqlens 🔭

Beautiful, structured HTTP request logger for Express. No noise, just clarity.

```
npm install reqlens
```

---

## Quick Start

```typescript
import express from "express";
import reqlens from "reqlens";

const app = express();
app.use(express.json());
app.use(reqlens()); // ← drop it in, done

app.get("/users", (req, res) => res.json({ users: [] }));
app.listen(3000);
```

---

## Options

```typescript
app.use(
  reqlens({
    showHeaders: false, // show request headers
    showBody: true, // show request body
    showQuery: true, // show query string params
    exclude: ["/health"], // skip these paths (* wildcard supported)
    maxBodyLength: 600, // max body chars to display
    redactHeaders: ["authorization", "cookie", "x-api-key"],
    theme: "dark", // 'dark' | 'light' | 'minimal'
    label: "reqlens", // custom label in box header
    compact: false, // single-line mode
  }),
);
```

---

## Themes

| Theme     | Description                         |
| --------- | ----------------------------------- |
| `dark`    | Colorful on dark terminal (default) |
| `light`   | Muted on light terminal             |
| `minimal` | Monochrome, no color                |

---

## Compact Mode

One line per request — great for high-traffic environments:

```typescript
app.use(reqlens({ compact: true }));
// 10:42:33  POST    /api/users   201   43ms
```

---

## Excluding Paths

```typescript
app.use(
  reqlens({
    exclude: ["/health", "/metrics", "/static/*", "/api/ping"],
  }),
);
```

---

## TypeScript Types

```typescript
import reqlens, { ReqLensOptions } from "reqlens";

const config: ReqLensOptions = {
  theme: "dark",
  showHeaders: true,
};

app.use(reqlens(config));
```

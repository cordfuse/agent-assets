---
name: http-fetch
description: HTTP GET request, returns status, headers, and body
type: tool
runtime: bun
dependencies: []
---

## What it does

Makes an HTTP GET request to a URL and returns the response status code, headers, and body. Supports custom request headers and a timeout.

## Schema

```json
{
  "name": "http_fetch",
  "description": "HTTP GET request, returns status, headers, and body",
  "input_schema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to fetch"
      },
      "headers": {
        "type": "object",
        "description": "Optional request headers as key-value pairs",
        "additionalProperties": { "type": "string" }
      },
      "timeout_ms": {
        "type": "number",
        "description": "Timeout in milliseconds (default: 10000)"
      }
    },
    "required": ["url"]
  }
}
```

## Implementation

```typescript
interface Input {
  url: string;
  headers?: Record<string, string>;
  timeout_ms?: number;
}

interface Output {
  status: number;
  headers: Record<string, string>;
  body: string;
  error?: string;
}

export async function http_fetch(input: Input): Promise<Output> {
  try {
    const res = await fetch(input.url, {
      method: 'GET',
      headers: input.headers,
      signal: AbortSignal.timeout(input.timeout_ms ?? 10000),
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => { headers[key] = value; });
    const body = await res.text();
    return { status: res.status, headers, body };
  } catch (err) {
    return { status: -1, headers: {}, body: '', error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = await http_fetch({ url: 'https://api.example.com/status' });
if (result.status !== 200) console.error(result.status, result.error);
else console.log(result.body);
```

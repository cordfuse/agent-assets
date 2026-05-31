---
name: http-post
description: HTTP POST request with JSON body, returns status and response body
type: tool
runtime: bun
dependencies: []
---

## What it does

Makes an HTTP POST request with a JSON body and returns the response status code and body. Supports custom headers and a timeout.

## Schema

```json
{
  "name": "http_post",
  "description": "HTTP POST request with JSON body, returns status and response body",
  "input_schema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to POST to"
      },
      "body": {
        "type": "object",
        "description": "JSON body to send"
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
    "required": ["url", "body"]
  }
}
```

## Implementation

```typescript
interface Input {
  url: string;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout_ms?: number;
}

interface Output {
  status: number;
  body: string;
  error?: string;
}

export async function http_post(input: Input): Promise<Output> {
  try {
    const res = await fetch(input.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...input.headers },
      body: JSON.stringify(input.body),
      signal: AbortSignal.timeout(input.timeout_ms ?? 10000),
    });
    const body = await res.text();
    return { status: res.status, body };
  } catch (err) {
    return { status: -1, body: '', error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = await http_post({
  url: 'https://api.example.com/messages',
  body: { channel: 'general', text: 'hello' },
  headers: { Authorization: `Bearer ${token}` },
});
if (result.status !== 200) console.error(result.error);
```

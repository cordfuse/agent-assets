---
name: read-environment
description: Read specific environment variable values by name without exposing the full environment
type: tool
runtime: bun
dependencies: []
---

## What it does

Reads named environment variables and returns their values. Accepts an optional `required` list; if any required keys are missing, they are reported separately. Never dumps the full environment — only returns what was explicitly requested.

## Schema

```json
{
  "name": "read_environment",
  "description": "Read specific environment variable values by name",
  "input_schema": {
    "type": "object",
    "properties": {
      "keys": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Environment variable names to read"
      },
      "required": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Subset of keys that must be present; missing ones are reported in the 'missing' field"
      }
    },
    "required": ["keys"]
  }
}
```

## Implementation

```typescript
interface Input {
  keys: string[];
  required?: string[];
}

interface Output {
  values: Record<string, string | undefined>;
  missing: string[];
  error?: string;
}

export function read_environment(input: Input): Output {
  const values: Record<string, string | undefined> = {};
  for (const key of input.keys) {
    values[key] = process.env[key];
  }

  const required = input.required ?? [];
  const missing = required.filter(k => !process.env[k]);

  return { values, missing };
}
```

## Usage

```typescript
const env = read_environment({
  keys: ['GITHUB_TOKEN', 'NODE_ENV', 'PORT'],
  required: ['GITHUB_TOKEN'],
});

if (env.missing.length > 0) {
  console.error(`Missing required env vars: ${env.missing.join(', ')}`);
}
console.log('NODE_ENV:', env.values.NODE_ENV);
```

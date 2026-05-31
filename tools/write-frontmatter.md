---
name: write-frontmatter
description: Update frontmatter fields in a markdown file without touching the body
type: tool
runtime: bun
dependencies: []
---

## What it does

Reads a markdown file, merges the given fields into its frontmatter, and writes it back. Body content is preserved exactly. New fields are appended to the frontmatter block. Existing fields are updated in place.

## Schema

```json
{
  "name": "write_frontmatter",
  "description": "Update frontmatter fields in a markdown file without touching the body",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Path to the markdown file"
      },
      "fields": {
        "type": "object",
        "description": "Key-value pairs to set in the frontmatter",
        "additionalProperties": true
      }
    },
    "required": ["path", "fields"]
  }
}
```

## Implementation

```typescript
import { readFileSync, writeFileSync } from 'fs';

interface Input {
  path: string;
  fields: Record<string, unknown>;
}

interface Output {
  success: boolean;
  error?: string;
}

function serializeValue(v: unknown): string {
  if (typeof v === 'string' && v.includes(':')) return `"${v}"`;
  return String(v);
}

export function write_frontmatter(input: Input): Output {
  try {
    const raw = readFileSync(input.path, 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

    let fmLines: string[];
    let body: string;

    if (match) {
      fmLines = match[1].split('\n');
      body = match[2];
    } else {
      fmLines = [];
      body = raw;
    }

    for (const [key, value] of Object.entries(input.fields)) {
      const idx = fmLines.findIndex(l => l.startsWith(`${key}:`));
      const line = `${key}: ${serializeValue(value)}`;
      if (idx >= 0) fmLines[idx] = line;
      else fmLines.push(line);
    }

    const updated = `---\n${fmLines.join('\n')}\n---\n${body}`;
    writeFileSync(input.path, updated, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
```

## Usage

```typescript
// Mark a message as read without touching the body
write_frontmatter({
  path: './inbox/2026-05-31T1200-hello.md',
  fields: { read: true },
});
```

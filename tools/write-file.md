---
name: write-file
description: Write or overwrite a file on disk, creating parent directories as needed
type: tool
runtime: bun
dependencies: []
---

## What it does

Writes content to a file at the given path. Creates parent directories if they don't exist. Overwrites the file if it already exists. Returns success or an error message.

## Schema

```json
{
  "name": "write_file",
  "description": "Write or overwrite a file on disk, creating parent directories as needed",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Absolute or relative path to write to"
      },
      "content": {
        "type": "string",
        "description": "Content to write"
      },
      "encoding": {
        "type": "string",
        "enum": ["utf8", "base64"],
        "description": "File encoding (default: utf8)"
      }
    },
    "required": ["path", "content"]
  }
}
```

## Implementation

```typescript
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface Input {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

interface Output {
  success: boolean;
  error?: string;
}

export function write_file(input: Input): Output {
  try {
    mkdirSync(dirname(input.path), { recursive: true });
    writeFileSync(input.path, input.content, input.encoding ?? 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = write_file({
  path: './manifest/hosts/cachy.md',
  content: '---\nalias: cachy\nhostname: steve-cachyos\n---\n',
});
if (!result.success) console.error(result.error);
```

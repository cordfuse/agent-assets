---
name: read-file
description: Read the contents of a file from disk
type: tool
runtime: bun
dependencies: []
---

## What it does

Reads a file at the given path and returns its contents as a string. Returns an error if the file does not exist or cannot be read.

## Schema

```json
{
  "name": "read_file",
  "description": "Read the contents of a file from disk",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Absolute or relative path to the file"
      },
      "encoding": {
        "type": "string",
        "enum": ["utf8", "base64"],
        "description": "File encoding (default: utf8)"
      }
    },
    "required": ["path"]
  }
}
```

## Implementation

```typescript
import { readFileSync } from 'fs';

interface Input {
  path: string;
  encoding?: 'utf8' | 'base64';
}

interface Output {
  content: string;
  error?: string;
}

export function read_file(input: Input): Output {
  try {
    const content = readFileSync(input.path, input.encoding ?? 'utf8');
    return { content };
  } catch (err) {
    return { content: '', error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = read_file({ path: './manifest/hosts/cachy.md' });
if (result.error) console.error(result.error);
else console.log(result.content);
```

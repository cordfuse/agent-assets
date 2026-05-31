---
name: list-directory
description: List files and directories at a path, with optional glob filter
type: tool
runtime: bun
dependencies: []
---

## What it does

Lists entries in a directory. Optionally filters by glob pattern. Returns each entry with its name, type (file/directory), and size in bytes. Does not recurse by default.

## Schema

```json
{
  "name": "list_directory",
  "description": "List files and directories at a path, with optional glob filter",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Directory path to list"
      },
      "glob": {
        "type": "string",
        "description": "Optional glob pattern to filter entries (e.g. '*.md')"
      },
      "recursive": {
        "type": "boolean",
        "description": "Recurse into subdirectories (default: false)"
      }
    },
    "required": ["path"]
  }
}
```

## Implementation

```typescript
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

interface Entry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
}

interface Input {
  path: string;
  glob?: string;
  recursive?: boolean;
}

interface Output {
  entries: Entry[];
  error?: string;
}

function matchGlob(name: string, glob: string): boolean {
  const pattern = glob.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${pattern}$`).test(name);
}

function listDir(dirPath: string, glob?: string, recursive?: boolean): Entry[] {
  const entries: Entry[] = [];
  for (const name of readdirSync(dirPath)) {
    const fullPath = join(dirPath, name);
    const stat = statSync(fullPath);
    const type = stat.isDirectory() ? 'directory' : 'file';
    if (!glob || type === 'directory' || matchGlob(name, glob)) {
      entries.push({ name, path: fullPath, type, size: stat.size });
    }
    if (recursive && type === 'directory') {
      entries.push(...listDir(fullPath, glob, recursive));
    }
  }
  return entries;
}

export function list_directory(input: Input): Output {
  try {
    return { entries: listDir(input.path, input.glob, input.recursive) };
  } catch (err) {
    return { entries: [], error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = list_directory({ path: './manifest/hosts', glob: '*.md' });
for (const entry of result.entries) {
  console.log(entry.name, entry.type, entry.size);
}
```

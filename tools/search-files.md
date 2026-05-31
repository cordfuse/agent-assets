---
name: search-files
description: Search for a string or regex pattern across files, returns matches with line numbers
type: tool
runtime: bun
dependencies: []
---

## What it does

Recursively searches files under a path for a string or regex pattern. Returns each match with its file path, line number, and the matching line content. Optionally filters by file glob pattern.

## Schema

```json
{
  "name": "search_files",
  "description": "Search for a string or regex pattern across files, returns matches with line numbers",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Root directory to search from"
      },
      "pattern": {
        "type": "string",
        "description": "String or regex pattern to search for"
      },
      "glob": {
        "type": "string",
        "description": "File glob to restrict search (e.g. '*.md', '*.ts')"
      },
      "case_sensitive": {
        "type": "boolean",
        "description": "Case-sensitive match (default: false)"
      },
      "max_results": {
        "type": "number",
        "description": "Maximum number of matches to return (default: 100)"
      }
    },
    "required": ["path", "pattern"]
  }
}
```

## Implementation

```typescript
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface Match {
  file: string;
  line: number;
  content: string;
}

interface Input {
  path: string;
  pattern: string;
  glob?: string;
  case_sensitive?: boolean;
  max_results?: number;
}

interface Output {
  matches: Match[];
  truncated: boolean;
  error?: string;
}

function matchGlob(name: string, glob: string): boolean {
  const pattern = glob.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${pattern}$`).test(name);
}

function searchDir(dirPath: string, regex: RegExp, glob: string | undefined, results: Match[], max: number): void {
  for (const name of readdirSync(dirPath)) {
    if (results.length >= max) return;
    const fullPath = join(dirPath, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, regex, glob, results, max);
    } else if (!glob || matchGlob(name, glob)) {
      const lines = readFileSync(fullPath, 'utf8').split('\n');
      for (let i = 0; i < lines.length && results.length < max; i++) {
        if (regex.test(lines[i])) {
          results.push({ file: fullPath, line: i + 1, content: lines[i].trim() });
        }
      }
    }
  }
}

export function search_files(input: Input): Output {
  try {
    const flags = input.case_sensitive ? 'g' : 'gi';
    const regex = new RegExp(input.pattern, flags);
    const max = input.max_results ?? 100;
    const matches: Match[] = [];
    searchDir(input.path, regex, input.glob, matches, max + 1);
    const truncated = matches.length > max;
    return { matches: matches.slice(0, max), truncated };
  } catch (err) {
    return { matches: [], truncated: false, error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = search_files({ path: './manifest', pattern: 'concierge', glob: '*.md' });
for (const match of result.matches) {
  console.log(`${match.file}:${match.line}  ${match.content}`);
}
```

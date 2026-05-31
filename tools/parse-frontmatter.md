---
name: parse-frontmatter
description: Extract YAML frontmatter and body from a markdown file
type: tool
runtime: bun
dependencies: []
---

## What it does

Parses a markdown file (or string) and returns the YAML frontmatter as a structured object and the body text separately. Returns empty frontmatter and the full string as body if no frontmatter block is present. No external dependencies — parses YAML manually for simple key-value frontmatter.

## Schema

```json
{
  "name": "parse_frontmatter",
  "description": "Extract YAML frontmatter and body from a markdown file or string",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Path to a markdown file (mutually exclusive with content)"
      },
      "content": {
        "type": "string",
        "description": "Markdown string to parse (mutually exclusive with path)"
      }
    }
  }
}
```

## Implementation

```typescript
import { readFileSync } from 'fs';

interface Input {
  path?: string;
  content?: string;
}

interface Output {
  frontmatter: Record<string, unknown>;
  body: string;
  error?: string;
}

function parseYaml(block: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const trimmed = value.trim();
    if (trimmed === 'true') result[key.trim()] = true;
    else if (trimmed === 'false') result[key.trim()] = false;
    else if (/^\d+$/.test(trimmed)) result[key.trim()] = parseInt(trimmed, 10);
    else result[key.trim()] = trimmed.replace(/^["']|["']$/g, '');
  }
  return result;
}

export function parse_frontmatter(input: Input): Output {
  try {
    const raw = input.content ?? readFileSync(input.path!, 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: raw };
    return { frontmatter: parseYaml(match[1]), body: match[2].trimStart() };
  } catch (err) {
    return { frontmatter: {}, body: '', error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = parse_frontmatter({ path: './manifest/hosts/cachy.md' });
console.log(result.frontmatter);  // { alias: 'cachy', hostname: 'steve-cachyos' }
console.log(result.body);         // markdown content after the --- block
```

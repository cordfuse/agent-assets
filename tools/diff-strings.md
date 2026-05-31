---
name: diff-strings
description: Produce a unified diff between two strings, with line counts for additions, deletions, and unchanged lines
type: tool
runtime: bun
dependencies: []
---

## What it does

Compares two strings line by line and returns a unified diff. Useful for review workflows, change tracking, and verification steps where you need to show what changed between two versions of content.

## Schema

```json
{
  "name": "diff_strings",
  "description": "Produce a unified diff between two strings",
  "input_schema": {
    "type": "object",
    "properties": {
      "a": {
        "type": "string",
        "description": "Original string"
      },
      "b": {
        "type": "string",
        "description": "Modified string"
      },
      "aLabel": {
        "type": "string",
        "description": "Label for the original (default: 'original')"
      },
      "bLabel": {
        "type": "string",
        "description": "Label for the modified version (default: 'modified')"
      },
      "context": {
        "type": "number",
        "description": "Lines of context around each change (default: 3)"
      }
    },
    "required": ["a", "b"]
  }
}
```

## Implementation

```typescript
interface Input {
  a: string;
  b: string;
  aLabel?: string;
  bLabel?: string;
  context?: number;
}

interface Output {
  diff: string;
  additions: number;
  deletions: number;
  unchanged: number;
  identical: boolean;
}

export function diff_strings(input: Input): Output {
  const aLabel = input.aLabel ?? 'original';
  const bLabel = input.bLabel ?? 'modified';
  const context = input.context ?? 3;

  const aLines = input.a.split('\n');
  const bLines = input.b.split('\n');

  // Myers diff algorithm — simple O(ND) implementation
  type Edit = { type: 'add' | 'del' | 'eq'; line: string };
  const edits: Edit[] = [];

  const m = aLines.length, n = bLines.length;
  const max = m + n;
  const v: number[] = new Array(2 * max + 1).fill(0);
  const trace: number[][] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      const ki = k + max;
      let x = (k === -d || (k !== d && v[ki - 1] < v[ki + 1]))
        ? v[ki + 1]
        : v[ki - 1] + 1;
      let y = x - k;
      while (x < m && y < n && aLines[x] === bLines[y]) { x++; y++; }
      v[ki] = x;
      if (x >= m && y >= n) break outer;
    }
  }

  // Backtrack
  let x = m, y = n;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d];
    const k = x - y;
    const ki = k + max;
    const prevK = (k === -d || (k !== d && vd[ki - 1] < vd[ki + 1])) ? k + 1 : k - 1;
    const prevX = vd[prevK + max];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) { x--; y--; edits.unshift({ type: 'eq', line: aLines[x] }); }
    if (d > 0) {
      if (x === prevX) edits.unshift({ type: 'add', line: bLines[--y] });
      else edits.unshift({ type: 'del', line: aLines[--x] });
    }
  }

  // Build unified diff with context
  let additions = 0, deletions = 0, unchanged = 0;
  const lines: string[] = [`--- ${aLabel}`, `+++ ${bLabel}`];

  let i = 0;
  while (i < edits.length) {
    if (edits[i].type === 'eq') { unchanged++; i++; continue; }

    const start = Math.max(0, i - context);
    const end = Math.min(edits.length, i + context + 1);
    const hunkEdits = edits.slice(start, end);

    const aStart = edits.slice(0, start).filter(e => e.type !== 'add').length + 1;
    const bStart = edits.slice(0, start).filter(e => e.type !== 'del').length + 1;
    const aLen = hunkEdits.filter(e => e.type !== 'add').length;
    const bLen = hunkEdits.filter(e => e.type !== 'del').length;

    lines.push(`@@ -${aStart},${aLen} +${bStart},${bLen} @@`);
    for (const e of hunkEdits) {
      if (e.type === 'add') { lines.push(`+${e.line}`); additions++; }
      else if (e.type === 'del') { lines.push(`-${e.line}`); deletions++; }
      else lines.push(` ${e.line}`);
    }
    i = end;
  }

  return {
    diff: lines.join('\n'),
    additions,
    deletions,
    unchanged,
    identical: additions === 0 && deletions === 0,
  };
}
```

## Usage

```typescript
const result = diff_strings({ a: 'hello\nworld', b: 'hello\nearth', aLabel: 'v1', bLabel: 'v2' });
console.log(result.diff);
// --- v1
// +++ v2
// @@ -1,2 +1,2 @@
//  hello
// -world
// +earth
```

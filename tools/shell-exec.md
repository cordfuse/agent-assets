---
name: shell-exec
description: Run a shell command and return stdout, stderr, and exit code
type: tool
runtime: bun
dependencies: []
---

## What it does

Executes a shell command and returns its stdout, stderr, and exit code. Supports an optional working directory and timeout. Use as an escape hatch when no dedicated tool covers the operation.

## Schema

```json
{
  "name": "shell_exec",
  "description": "Run a shell command and return stdout, stderr, and exit code",
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "Shell command to execute"
      },
      "cwd": {
        "type": "string",
        "description": "Working directory (default: process.cwd())"
      },
      "timeout_ms": {
        "type": "number",
        "description": "Timeout in milliseconds (default: 30000)"
      }
    },
    "required": ["command"]
  }
}
```

## Implementation

```typescript
import { spawnSync } from 'child_process';

interface Input {
  command: string;
  cwd?: string;
  timeout_ms?: number;
}

interface Output {
  stdout: string;
  stderr: string;
  exit_code: number;
  timed_out: boolean;
  error?: string;
}

export function shell_exec(input: Input): Output {
  try {
    const result = spawnSync('sh', ['-c', input.command], {
      cwd: input.cwd ?? process.cwd(),
      timeout: input.timeout_ms ?? 30000,
      encoding: 'utf8',
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exit_code: result.status ?? -1,
      timed_out: result.signal === 'SIGTERM',
      error: result.error?.message,
    };
  } catch (err) {
    return { stdout: '', stderr: '', exit_code: -1, timed_out: false, error: (err as Error).message };
  }
}
```

## Usage

```typescript
const result = shell_exec({ command: 'git log --oneline -5', cwd: '/home/user/repo' });
if (result.exit_code !== 0) console.error(result.stderr);
else console.log(result.stdout);
```

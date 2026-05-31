---
name: run-tests
description: Execute the project test suite and return pass/fail counts with failure output
type: tool
runtime: bun
dependencies: []
---

## What it does

Detects the test runner from `package.json` scripts and executes the test suite. Returns structured results including pass/fail counts, failure details, and raw output. Supports bun test, Jest, Vitest, and any `npm test`-compatible runner.

## Schema

```json
{
  "name": "run_tests",
  "description": "Execute the project test suite and return pass/fail counts with failure output",
  "input_schema": {
    "type": "object",
    "properties": {
      "cwd": {
        "type": "string",
        "description": "Working directory to run tests in (default: process.cwd())"
      },
      "filter": {
        "type": "string",
        "description": "Optional test name filter pattern passed to the test runner"
      },
      "timeout": {
        "type": "number",
        "description": "Max milliseconds to wait for test suite completion (default: 60000)"
      }
    },
    "required": []
  }
}
```

## Implementation

```typescript
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Input {
  cwd?: string;
  filter?: string;
  timeout?: number;
}

interface Output {
  passed: number;
  failed: number;
  skipped: number;
  exitCode: number;
  stdout: string;
  stderr: string;
  runner: string;
  durationMs: number;
  error?: string;
}

async function detectRunner(cwd: string): Promise<string[]> {
  try {
    const pkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'));
    const testScript = pkg.scripts?.test ?? '';
    if (testScript.includes('vitest')) return ['npx', 'vitest', 'run'];
    if (testScript.includes('jest')) return ['npx', 'jest'];
    if (testScript.includes('bun')) return ['bun', 'test'];
  } catch {}
  // Default: try bun test, fall back to npm test
  return ['bun', 'test'];
}

function parseTestCounts(output: string): { passed: number; failed: number; skipped: number } {
  const passMatch = output.match(/(\d+)\s+pass/i);
  const failMatch = output.match(/(\d+)\s+fail/i);
  const skipMatch = output.match(/(\d+)\s+skip/i);
  return {
    passed: passMatch ? parseInt(passMatch[1]) : 0,
    failed: failMatch ? parseInt(failMatch[1]) : 0,
    skipped: skipMatch ? parseInt(skipMatch[1]) : 0,
  };
}

export async function run_tests(input: Input): Promise<Output> {
  const cwd = input.cwd ?? process.cwd();
  const timeout = input.timeout ?? 60000;
  const start = Date.now();

  const cmd = await detectRunner(cwd);
  if (input.filter) cmd.push('--testNamePattern', input.filter);

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const proc = spawn(cmd[0], cmd.slice(1), {
      cwd,
      env: { ...process.env },
      timeout,
    });

    proc.stdout?.on('data', (d) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (exitCode) => {
      const combined = stdout + stderr;
      const counts = parseTestCounts(combined);
      resolve({
        ...counts,
        exitCode: exitCode ?? 1,
        stdout,
        stderr,
        runner: cmd[0],
        durationMs: Date.now() - start,
      });
    });

    proc.on('error', (err) => {
      resolve({
        passed: 0, failed: 0, skipped: 0,
        exitCode: 1, stdout, stderr,
        runner: cmd[0],
        durationMs: Date.now() - start,
        error: err.message,
      });
    });
  });
}
```

## Usage

```typescript
const result = await run_tests({ cwd: '/path/to/project' });
if (result.failed > 0) {
  console.error(`${result.failed} tests failed:\n${result.stderr}`);
} else {
  console.log(`All ${result.passed} tests passed in ${result.durationMs}ms`);
}
```

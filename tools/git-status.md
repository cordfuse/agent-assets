---
name: git-status
description: Return working tree status as structured data
type: tool
runtime: bun
dependencies: []
---

## What it does

Returns the git working tree status as structured data: current branch, lists of staged, unstaged, and untracked files. Uses `git status --porcelain=v1` for machine-readable output.

## Schema

```json
{
  "name": "git_status",
  "description": "Return working tree status as structured data",
  "input_schema": {
    "type": "object",
    "properties": {
      "cwd": {
        "type": "string",
        "description": "Repository working directory (default: process.cwd())"
      }
    }
  }
}
```

## Implementation

```typescript
import { spawnSync } from 'child_process';

interface FileStatus {
  path: string;
  staged_status: string;
  unstaged_status: string;
}

interface Output {
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  files: FileStatus[];
  clean: boolean;
  error?: string;
}

export function git_status(input: { cwd?: string }): Output {
  const cwd = input.cwd ?? process.cwd();

  const branchResult = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf8' });
  const branch = branchResult.stdout.trim();

  const statusResult = spawnSync('git', ['status', '--porcelain=v1'], { cwd, encoding: 'utf8' });
  if (statusResult.status !== 0) {
    return { branch, staged: [], unstaged: [], untracked: [], files: [], clean: true, error: statusResult.stderr.trim() };
  }

  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];
  const files: FileStatus[] = [];

  for (const line of statusResult.stdout.split('\n').filter(Boolean)) {
    const stagedStatus = line[0];
    const unstagedStatus = line[1];
    const path = line.slice(3).trim();
    files.push({ path, staged_status: stagedStatus, unstaged_status: unstagedStatus });
    if (stagedStatus === '?') untracked.push(path);
    else {
      if (stagedStatus !== ' ') staged.push(path);
      if (unstagedStatus !== ' ') unstaged.push(path);
    }
  }

  return { branch, staged, unstaged, untracked, files, clean: files.length === 0 };
}
```

## Usage

```typescript
const status = git_status({ cwd: '/home/user/transport' });
console.log(`Branch: ${status.branch}, clean: ${status.clean}`);
console.log('Staged:', status.staged);
console.log('Untracked:', status.untracked);
```

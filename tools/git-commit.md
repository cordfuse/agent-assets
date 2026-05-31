---
name: git-commit
description: Stage specific files and create a git commit
type: tool
runtime: bun
dependencies: []
---

## What it does

Stages one or more files and creates a git commit with the given message. Optionally sets the author name and email for the commit. Returns the commit hash on success.

## Schema

```json
{
  "name": "git_commit",
  "description": "Stage specific files and create a git commit",
  "input_schema": {
    "type": "object",
    "properties": {
      "paths": {
        "type": "array",
        "items": { "type": "string" },
        "description": "File paths to stage (relative to cwd)"
      },
      "message": {
        "type": "string",
        "description": "Commit message"
      },
      "cwd": {
        "type": "string",
        "description": "Repository working directory (default: process.cwd())"
      },
      "author_name": {
        "type": "string",
        "description": "Git author name (default: repo config)"
      },
      "author_email": {
        "type": "string",
        "description": "Git author email (default: repo config)"
      }
    },
    "required": ["paths", "message"]
  }
}
```

## Implementation

```typescript
import { spawnSync } from 'child_process';

interface Input {
  paths: string[];
  message: string;
  cwd?: string;
  author_name?: string;
  author_email?: string;
}

interface Output {
  success: boolean;
  commit_hash?: string;
  error?: string;
}

function run(cmd: string, args: string[], cwd: string, env?: Record<string, string>): { stdout: string; stderr: string; code: number } {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '', code: result.status ?? -1 };
}

export function git_commit(input: Input): Output {
  const cwd = input.cwd ?? process.cwd();
  const env: Record<string, string> = {};
  if (input.author_name) env['GIT_AUTHOR_NAME'] = env['GIT_COMMITTER_NAME'] = input.author_name;
  if (input.author_email) env['GIT_AUTHOR_EMAIL'] = env['GIT_COMMITTER_EMAIL'] = input.author_email;

  const add = run('git', ['add', '--', ...input.paths], cwd);
  if (add.code !== 0) return { success: false, error: add.stderr.trim() };

  const commit = run('git', ['commit', '-m', input.message], cwd, env);
  if (commit.code !== 0) return { success: false, error: commit.stderr.trim() };

  const hash = run('git', ['rev-parse', 'HEAD'], cwd);
  return { success: true, commit_hash: hash.stdout.trim() };
}
```

## Usage

```typescript
const result = git_commit({
  paths: ['manifest/hosts/cachy.md'],
  message: 'feat: add cachy host file',
  author_name: 'concierge',
  author_email: 'concierge@cachy.crosstalk.local',
  cwd: '/home/user/transport',
});
console.log(result.commit_hash);
```

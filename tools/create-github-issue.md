---
name: create-github-issue
description: Create a GitHub issue in a repository with title, body, labels, and assignees
type: tool
runtime: bun
dependencies: []
---

## What it does

Creates a GitHub issue via the GitHub REST API. Returns the issue number, URL, and ID. Requires a `GITHUB_TOKEN` environment variable with `issues: write` permission on the target repository.

## Schema

```json
{
  "name": "create_github_issue",
  "description": "Create a GitHub issue in a repository",
  "input_schema": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repository slug in owner/repo format"
      },
      "title": {
        "type": "string",
        "description": "Issue title"
      },
      "body": {
        "type": "string",
        "description": "Issue body (markdown supported)"
      },
      "labels": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Label names to apply (must already exist in the repo)"
      },
      "assignees": {
        "type": "array",
        "items": { "type": "string" },
        "description": "GitHub usernames to assign"
      }
    },
    "required": ["repo", "title"]
  }
}
```

## Implementation

```typescript
interface Input {
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

interface Output {
  number: number;
  url: string;
  id: number;
  error?: string;
}

export async function create_github_issue(input: Input): Promise<Output> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { number: 0, url: '', id: 0, error: 'GITHUB_TOKEN not set' };

  const url = `https://api.github.com/repos/${input.repo}/issues`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: input.title,
        body: input.body ?? '',
        labels: input.labels ?? [],
        assignees: input.assignees ?? [],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { number: 0, url: '', id: 0, error: `GitHub API ${res.status}: ${err}` };
    }

    const data = await res.json() as { number: number; html_url: string; id: number };
    return { number: data.number, url: data.html_url, id: data.id };
  } catch (err) {
    return { number: 0, url: '', id: 0, error: (err as Error).message };
  }
}
```

## Usage

```typescript
const issue = await create_github_issue({
  repo: 'cordfuse/crosstalk-runtime',
  title: 'Coordinator does not release lock on timeout',
  body: 'Steps to reproduce...',
  labels: ['bug'],
});
if (issue.error) console.error(issue.error);
else console.log(`Created issue #${issue.number}: ${issue.url}`);
```

---
name: fetch-github-issue
description: Fetch a GitHub issue by number, returning title, body, state, labels, and optionally comments
type: tool
runtime: bun
dependencies: []
---

## What it does

Fetches a GitHub issue via the REST API. Returns structured content including title, body, state, labels, author, timestamps, and optionally the comment thread. Useful for loading issue context before acting on it.

## Schema

```json
{
  "name": "fetch_github_issue",
  "description": "Fetch a GitHub issue by number",
  "input_schema": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repository slug in owner/repo format"
      },
      "number": {
        "type": "number",
        "description": "Issue number"
      },
      "includeComments": {
        "type": "boolean",
        "description": "Whether to fetch the comment thread (default: false)"
      }
    },
    "required": ["repo", "number"]
  }
}
```

## Implementation

```typescript
interface Comment {
  author: string;
  body: string;
  createdAt: string;
}

interface Input {
  repo: string;
  number: number;
  includeComments?: boolean;
}

interface Output {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  comments?: Comment[];
  error?: string;
}

async function ghFetch(path: string, token?: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

export async function fetch_github_issue(input: Input): Promise<Output> {
  const token = process.env.GITHUB_TOKEN;

  try {
    const issue = await ghFetch(`/repos/${input.repo}/issues/${input.number}`, token) as any;

    const output: Output = {
      number: issue.number,
      title: issue.title,
      body: issue.body ?? '',
      state: issue.state,
      labels: issue.labels.map((l: any) => l.name),
      author: issue.user.login,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
    };

    if (input.includeComments) {
      const raw = await ghFetch(`/repos/${input.repo}/issues/${input.number}/comments`, token) as any[];
      output.comments = raw.map(c => ({
        author: c.user.login,
        body: c.body,
        createdAt: c.created_at,
      }));
    }

    return output;
  } catch (err) {
    return {
      number: input.number, title: '', body: '', state: 'open',
      labels: [], author: '', createdAt: '', updatedAt: '',
      url: `https://github.com/${input.repo}/issues/${input.number}`,
      error: (err as Error).message,
    };
  }
}
```

## Usage

```typescript
const issue = await fetch_github_issue({ repo: 'cordfuse/crosstalk-runtime', number: 42, includeComments: true });
if (issue.error) console.error(issue.error);
else console.log(`#${issue.number} [${issue.state}] ${issue.title}\n\n${issue.body}`);
```

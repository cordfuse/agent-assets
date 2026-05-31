---
name: fetch-skill
description: Fetch the SKILL.md content from a skills.sh GitHub repo
type: tool
runtime: bun
dependencies: []
---

## What it does

Fetches the `SKILL.md` file from a GitHub repository and returns its raw content. Tries `main` branch first, falls back to `master`. Also returns the parsed frontmatter name and description if present.

## Schema

```json
{
  "name": "fetch_skill",
  "description": "Fetch the SKILL.md content from a skills.sh GitHub repo",
  "input_schema": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Full repo slug, e.g. 'anthropics/skills' or 'vercel-labs/skills'"
      },
      "path": {
        "type": "string",
        "description": "Optional path to SKILL.md within the repo (default: SKILL.md at root)"
      }
    },
    "required": ["repo"]
  }
}
```

## Implementation

```typescript
interface Input {
  repo: string;
  path?: string;
}

interface Output {
  content: string;
  name?: string;
  description?: string;
  repo: string;
  url: string;
  error?: string;
}

async function tryFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) return await res.text();
  } catch {}
  return null;
}

function parseFrontmatter(content: string): { name?: string; description?: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) result[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return { name: result['name'], description: result['description'] };
}

export async function fetch_skill(input: Input): Promise<Output> {
  const filePath = input.path ?? 'SKILL.md';
  const branches = ['main', 'master'];
  const baseUrl = `https://raw.githubusercontent.com/${input.repo}`;
  const repoUrl = `https://github.com/${input.repo}`;

  for (const branch of branches) {
    const url = `${baseUrl}/${branch}/${filePath}`;
    const content = await tryFetch(url);
    if (content !== null) {
      const { name, description } = parseFrontmatter(content);
      return { content, name, description, repo: input.repo, url: repoUrl };
    }
  }

  return { content: '', repo: input.repo, url: repoUrl, error: `SKILL.md not found in ${input.repo}` };
}
```

## Usage

```typescript
const skill = await fetch_skill({ repo: 'anthropics/skills' });
if (skill.error) console.error(skill.error);
else console.log(`${skill.name}: ${skill.description}\n\n${skill.content}`);
```

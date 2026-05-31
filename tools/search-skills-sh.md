---
name: search-skills-sh
description: Search the skills.sh catalog and return matching skills with repo and description
type: tool
runtime: bun
dependencies: []
---

## What it does

Searches the skills.sh catalog for agent skills matching a query. Uses the GitHub Search API since skills.sh skills are GitHub repositories. Returns a ranked list of matches with name, description, owner, repo slug, and URL.

## Schema

```json
{
  "name": "search_skills_sh",
  "description": "Search the skills.sh catalog and return matching skills with repo and description",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search terms (e.g. 'typescript linting', 'azure devops', 'code review')"
      },
      "max_results": {
        "type": "number",
        "description": "Maximum results to return (default: 10)"
      }
    },
    "required": ["query"]
  }
}
```

## Implementation

```typescript
interface SkillResult {
  name: string;
  description: string;
  owner: string;
  repo: string;
  url: string;
  stars: number;
}

interface Input {
  query: string;
  max_results?: number;
}

interface Output {
  results: SkillResult[];
  total: number;
  error?: string;
}

export async function search_skills_sh(input: Input): Promise<Output> {
  const max = input.max_results ?? 10;
  // Search GitHub for repos containing SKILL.md matching the query
  const q = encodeURIComponent(`${input.query} filename:SKILL.md`);
  const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${max}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { results: [], total: 0, error: `GitHub API error: ${res.status}` };

    const data = await res.json() as { total_count: number; items: Array<{ name: string; description: string; owner: { login: string }; full_name: string; html_url: string; stargazers_count: number }> };

    const results: SkillResult[] = data.items.map(item => ({
      name: item.name,
      description: item.description ?? '',
      owner: item.owner.login,
      repo: item.full_name,
      url: item.html_url,
      stars: item.stargazers_count,
    }));

    return { results, total: data.total_count };
  } catch (err) {
    return { results: [], total: 0, error: (err as Error).message };
  }
}
```

## Usage

```typescript
const results = await search_skills_sh({ query: 'typescript code review', max_results: 5 });
for (const r of results.results) {
  console.log(`${r.repo} (${r.stars}★) — ${r.description}`);
}
```

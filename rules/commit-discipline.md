---
name: commit-discipline
description: One fix or feature per commit; never pile up changes; only commit when asked
type: rule
scope: workflow
---

## Rule

**Only commit when explicitly asked.** Never auto-commit as a side effect of completing a task.

When committing:
- One bug fix = one commit
- One feature = one commit
- Never let changes pile up across multiple fixes or features in a single commit
- Commit messages focus on the WHY, not the WHAT

This keeps history bisectable and diffs reviewable. Large unstaged diffs create confusion about what changed and why.

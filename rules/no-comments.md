---
name: no-comments
description: Don't write explanatory code comments; only add one when the WHY is non-obvious
type: rule
scope: code
---

## Rule

Default to writing **no comments**. Only add one when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behavior that would surprise a reader. If removing the comment wouldn't confuse a future reader, don't write it.

**Never:**
- Explain what the code does — well-named identifiers already do that
- Write multi-paragraph docstrings or multi-line comment blocks
- Reference the current task, fix, or callers ("used by X", "added for the Y flow", "handles the case from issue #123") — those belong in the PR description and rot as the codebase evolves

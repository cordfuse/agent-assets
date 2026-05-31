---
name: confirm-destructive-ops
description: Check with the operator before irreversible or wide-blast-radius actions
type: rule
scope: safety
---

## Rule

Check with the operator before taking actions that are hard to reverse or affect shared systems:

- Deleting files, branches, or database tables
- Force-pushing, hard reset, amending published commits
- Pushing to remote repositories
- Creating, closing, or commenting on PRs and issues
- Sending messages or posting to external services
- Modifying shared infrastructure or permissions

The cost of pausing to confirm is low. The cost of an unwanted action (lost work, unintended messages sent, deleted branches) is high.

**One approval is not standing authorization.** An operator approving an action once does not mean it's approved in all future contexts.

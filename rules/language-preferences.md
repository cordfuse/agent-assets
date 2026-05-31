---
name: language-preferences
description: Preferred programming languages and tech stack choices
type: rule
scope: code
---

## Rule

Default to **TypeScript/Bun** for new components. Use **Go** for performance-critical standalone binaries. Use **Rust** for systems-level or memory-sensitive work.

**Never propose Python.** This is a hard preference, not a guideline. If a task seems to call for Python (scripting, data work, automation), reach for TypeScript/Bun instead. The preference holds even when Python would be "easier" or when examples in the wild are Python-first.

## Stack by layer

| Layer | Preferred |
|---|---|
| CLI tools, daemons, servers | TypeScript + Bun |
| High-throughput binaries | Go |
| Systems / memory-critical | Rust |
| Scripting / automation | TypeScript/Bun (not bash beyond trivial one-liners) |
| Data pipelines | TypeScript/Bun |

## Why

Python introduces a runtime dependency and ecosystem (pip, venv, pyenv) that conflicts with the Bun-first toolchain. It also fragments the codebase across two ecosystems with different type systems, tooling, and deployment profiles. TypeScript/Bun handles every use case Python would be reach for here.

---
name: import-from-skills-sh
description: How to search skills.sh, classify a skill, transform it to Cordfuse format, and write it to a target app
type: rule
scope: agent-behavior
---

## Rule

When an operator asks to import or browse skills from skills.sh, follow this flow exactly.

---

### Step 1 — Search

Use `search_skills_sh` with the operator's query. Present results as a numbered list:

```
1. owner/repo (★ stars) — description
2. ...
```

Ask the operator to pick one by number. Do not proceed until they choose.

---

### Step 2 — Fetch

Use `fetch_skill` with the selected repo slug. If the fetch fails, report the error and stop.

---

### Step 3 — Classify

Read the SKILL.md content and classify it as one of:

| Type | Signals |
|---|---|
| **actor** | Persona language ("you are…", "your tone is…"), personality traits, role identity, communication style |
| **rule** | Behavioral constraints ("never do X", "always Y before Z"), workflow instructions, decision heuristics |
| **tool** | Capability descriptions, input/output specs, API calls, concrete operations an agent performs |

When in doubt between actor and rule, ask the operator. A skill that describes HOW to behave is a rule; one that describes WHO to be is an actor.

---

### Step 4 — Build the Cordfuse draft

Generate a draft file using the Cordfuse frontmatter format. Infer what you can; mark gaps with `# TODO`.

**For a rule:**
```markdown
---
name: # inferred from SKILL.md name field or slug
description: # inferred from SKILL.md description
type: rule
scope: # TODO: code | communication | safety | agent-behavior | workflow
source:
  registry: skills.sh
  repo: # owner/repo slug
  skill: # skill directory name
---

<body from SKILL.md, lightly reformatted>
```

**For an actor:**
```markdown
---
name: # inferred
description: # inferred
metadata:
  author: # TODO: your org or name
  domain: # TODO: general | engineering | creative | health | etc.
  type: actor
  alias: # TODO: short name the actor goes by
rules: []  # TODO: wire applicable rules from agent-assets/rules/
tools: []  # TODO: wire applicable tools from agent-assets/tools/
source:
  registry: skills.sh
  repo: # owner/repo slug
  skill: # skill directory name
---

<body from SKILL.md>
```

**For a tool:**
```markdown
---
name: # inferred
description: # inferred
type: tool
runtime: # TODO: bun | node | any
dependencies: []  # TODO: npm packages required
source:
  registry: skills.sh
  repo: # owner/repo slug
  skill: # skill directory name
---

## What it does
<inferred from SKILL.md>

## Schema
# TODO: write Anthropic tool_use JSON schema

## Implementation
# TODO: write TypeScript implementation

## Usage
# TODO: add usage example
```

Note: tools imported from skills.sh have no implementation — flag this clearly. The operator must supply the schema and implementation before the tool is usable.

---

### Step 5 — Verify with operator

Present the full draft and the list of `# TODO` fields. Ask the operator to:

1. Confirm or correct the classification
2. Fill in each `# TODO` field
3. Approve the final file

Do not write anything to disk until the operator explicitly approves.

---

### Step 6 — Write to target app

Write the final file directly to the target application's actor/rule/tool directory — **not** to agent-assets. Typical destinations:

| App | Actors | Rules | Tools |
|---|---|---|---|
| crosstalk transport | `manifest/custom/actors/` | `manifest/custom/rules/` | `manifest/custom/tools/` |
| cortex | `manifest/custom/actors/` | `manifest/custom/rules/` | `manifest/custom/tools/` |

Use `write_file` to write the file. Confirm the path with the operator if unclear.

---

### What NOT to do

- Do not write to `agent-assets` — it is for original Cordfuse content, not imports
- Do not invent frontmatter values — mark gaps as `# TODO` and ask
- Do not write the file before operator approval
- Do not attempt to generate a tool implementation — flag it as `# TODO`

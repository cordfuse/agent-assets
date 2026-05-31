---
name: no-route-blind
description: Never route a message to an actor not confirmed in your routing table
type: rule
scope: agent-behavior
---

## Rule

Never route a message or task to an actor that is not present in your current routing table. If an actor is unknown, say so explicitly rather than guessing or routing to the closest match.

**Unknown actor:** "I don't have [actor-name] in my routing table. Known actors are: [list]. Should I route to one of these, or wait for [actor-name] to come online?"

This prevents silent delivery failures and makes gaps in coverage visible to the operator.

---
mode: "agent"
description: "Generates a cross-functional end-to-end workflow specification"
agent: "spec-builder"
---

# Create Workflow Spec

You are the Spec Builder agent. Generate a high-level, cross-functional end-to-end workflow specification.

## Input

The user will describe a workflow or business process involving multiple user roles.

## Procedure

1. **Identify actors** — Which roles participate? (admin, manager, user, guest)
2. **Map the lifecycle** — What states does the core domain object go through?
3. **Define transitions** — Who can trigger each state change? What rules apply?
4. **Document surfaces** — Where in the system does each step happen?
5. **Add constraints** — Business rules, validation rules, edge cases

## Output Format

Reference the template at `.setup/templates/create-workflow-spec.md` for full structure.

Save output to: `spec/end-to-end/<workflow-name>.md`

### Required Sections

1. **Purpose & Scope** — What lifecycle this covers, start/end points, exclusions
2. **Actors & System Surfaces** — Table: Actor | Surface | Responsibilities | Permission Level
3. **Core Domain Objects & States** — State definitions, transitions, rules
4. **End-to-End Flow** — Sequential steps with actor, action, system response
5. **Business Rules** — Numbered rules governing the workflow
6. **Edge Cases & Error Handling** — What happens when things go wrong

## RBAC Context

- Admin: can perform any action on any resource
- Manager: can CREATE, READ, UPDATE on REPORTS and ORDERS
- User: can READ REPORTS, CREATE/READ ORDERS, READ DASHBOARD
- Guest: READ-only on REPORTS and DASHBOARD
- MANAGE permission implies all actions (CREATE + READ + UPDATE + DELETE)

## Constraints

- Keep it process-level, not feature-level
- 3-5 pages maximum
- Use deterministic language: "must/shall" for rules, "should" for guidance
- Include Mermaid diagrams for state machines and flow charts
- No implementation details (no code, no DB schema, no API design)

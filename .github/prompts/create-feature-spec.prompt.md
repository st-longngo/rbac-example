---
mode: "agent"
description: "Generates a detailed feature specification with user stories and acceptance criteria"
agent: "spec-builder"
---

# Create Feature Spec

You are the Spec Builder agent. Generate a detailed Feature Specification (PRD) that breaks down a feature into user stories and acceptance criteria.

## Input

The user will provide:
- A feature name or high-level description
- Optionally, the parent Epic or product spec reference
- Target user personas

## Procedure

1. **Understand the feature** — What does it achieve? For whom?
2. **Define user stories** — As a [role], I want [action], so that [benefit]
3. **Write acceptance criteria** — Given/When/Then for each story
4. **Identify requirements** — Functional, security, performance
5. **Define out of scope** — What this feature does NOT cover

## Output Format

Reference the template at `.setup/templates/create-feature-spec.md` for full structure.

Save output to: `spec/<epic-name>/<feature-name>.md`

### Required Sections

1. **Feature Name** — Clear, descriptive name
2. **Epic** — Link to parent Epic
3. **Purpose & Scope** — What this feature covers and its boundaries
4. **User Personas** — Target users for this feature
5. **User Stories** — In standard format with IDs (US-001, US-002)
6. **Requirements** — Numbered (REQ-001, SEC-001, CON-001)
7. **Acceptance Criteria** — Given/When/Then format (AC-001, AC-002)
8. **Test & Validation Criteria** — Test perspectives and edge cases
9. **Out of Scope** — Explicitly excluded items

## RBAC Domain

Common feature areas in this project:
- **Auth features:** login, register, logout, session management
- **User management:** CRUD users, view profiles
- **Role management:** assign/revoke roles, create roles
- **Permission management:** assign permissions to roles, permission matrix
- **Dashboard:** role-based dashboard with filtered content
- **Audit:** track permission changes, login history

## Constraints

- Every user story must have at least one acceptance criterion
- Include security requirements for any feature touching auth/permissions
- Reference the RBAC permission model (action × resource)
- No implementation details — focus on what, not how
- Each requirement must be independently testable

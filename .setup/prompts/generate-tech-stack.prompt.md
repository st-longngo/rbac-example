---
description: "Analyze codebase and generate a technology stack blueprint. Auto-detects languages, frameworks, dependencies, patterns, and conventions."
agent: "agent"
---

# Technology Stack Blueprint Generator

Output: `docs/tech-stack.md`

## Instructions

Analyze the codebase and generate an implementation-ready technology stack blueprint.

### 1. Detection

Scan project files, configs, lock files, and dependencies to identify:
- Languages, runtimes, and versions
- Frameworks and meta-frameworks (Next.js, Nuxt, SvelteKit, Django, Rails, Spring Boot, ASP.NET, etc.)
- Package managers and dependency counts
- Build tools, bundlers, transpilers
- TypeScript/type system configuration

### 2. Stack Layers

Document each layer with versions and purpose:

| Layer | Document |
|-------|----------|
| **Frontend** | Framework, UI library, component library, styling (CSS modules/Tailwind/styled-components), state management, form handling, routing |
| **Backend** | Runtime, framework, API style (REST/GraphQL/tRPC), middleware, auth strategy |
| **Database** | Engine, ORM/query builder, migration tool, seeding approach |
| **Testing** | Unit (Jest/Vitest), integration, E2E (Playwright/Cypress), coverage tool |
| **DevOps** | CI/CD, containerization, hosting/deployment, monitoring |
| **Dev Tooling** | Linter, formatter, pre-commit hooks, IDE config |

### 3. Conventions

Per technology area:
- **Naming**: Files, components, functions, variables, types/interfaces
- **Organization**: Module boundaries, barrel exports, co-location patterns
- **Patterns**: Error handling, logging, config access, auth, validation

### 4. Key Integration Patterns

Extract representative patterns actually used in the codebase:
- **API layer**: Route/controller structure, request/response types, validation, error handling
- **Data access**: ORM usage, repository pattern, queries, transactions
- **Services**: Business logic organization, DI/composition, cross-cutting concerns
- **UI components**: Component structure, props/state, data fetching, event handling

### 5. Implementation Blueprint

- **Templates**: Standard structure for each component type (page, API route, service, model, test)
- **Checklists**: Steps to add a new feature end-to-end
- **Testing patterns**: Standard test patterns per layer

### 6. Technology Decisions

- Rationale for key choices evident in code
- Deprecated/legacy items marked for replacement
- Upgrade paths and constraints

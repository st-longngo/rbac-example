---
description: "Generate complete GitHub Copilot configuration (instructions, agents, prompts, skills) based on the project's technology stack."
agent: "agent"
---

# GitHub Copilot Configuration Generator

Create a production-ready GitHub Copilot configuration tailored to the project's technology stack.

## Context

Read from `/docs/` (if available).

If docs are missing, auto-detect from config files and dependencies, or ask the user for: primary language/framework, project type, and key technologies.

## Files to Create

### 1. Instructions `.github/instructions/`

**Content rules:**
- Write as declarative rules, not conversational prose
- Use short, scannable bullet points — Copilot parses these at every suggestion
- State what to do AND what not to do — anti-patterns are as important as patterns
- Include real code snippets from your actual codebase, not generic examples
- Keep each file under 50 lines — too long dilutes focus and slows context matching
- Never repeat rules across files — each instruction file owns its domain
- Use applyTo precisely — overly broad patterns inject irrelevant noise

| File | Scope | `applyTo` |
|------|-------|-----------|
| **Core** |||
| `project-context.instructions.md` | Defines tech stack (e.g. Next.js 15, Prisma, PostgreSQL), runtime versions, package manager, monorepo structure, folder layout, and module boundaries so Copilot understands the full project context | `**/*` |
| `<primary-language>.instructions.md` | Enforces strict mode, prefers interface over type for objects, bans any in favor of unknown, defines generics usage, utility type preferences, and enum vs union patterns | `**/*.ts,**/*.tsx` |
| `code-style.instructions.md` | Summarizes ESLint/Prettier rules, import ordering (external → internal → relative), naming conventions (camelCase functions, PascalCase components, UPPER_SNAKE constants), max line length, and barrel export rules | `**/*.ts,**/*.tsx,**/*.js,**/*.jsx` |
| **Frontend** |||
| `component.instructions.md` | Defines component file structure (props interface → component → export), colocation of tests/stories/styles, composition over prop drilling, separation of smart vs presentational components, Server vs Client component boundaries, and reusable component API design | `**/components/**` |
| `styling.instructions.md` | Sets Tailwind as primary styling approach, defines design tokens (colors, spacing, typography), enforces mobile-first responsive breakpoints, dark mode strategy (class vs media), CSS Modules vs global styles, and rules for when custom CSS is acceptable | `**/*.css,**/*.scss,**/*.module.css,**/*.tsx,**/*.jsx` |
| `routing.instructions.md` | Specifies App Router conventions, file-based routing patterns (page.tsx, layout.tsx, loading.tsx, error.tsx), route groups, parallel routes, intercepting routes, middleware placement, dynamic route handling, and redirect patterns | `**/app/**,**/pages/**` |
| **Backend** |||
| `api-design.instructions.md` | Defines API Route handlers (route.ts convention), REST endpoint structure, standard response envelope { data, error, meta }, pagination format, status code usage, request validation with Zod, auth middleware (headers/cookies), rate limiting, and edge vs Node runtime choices | `**/api/**` |
| `database.instructions.md` | Specifies ORM patterns (Prisma/Drizzle), table naming (snake_case plural), soft delete strategy, timestamps on all tables, UUID vs auto-increment preference, migration naming, N+1 prevention via select/include, transaction handling, and indexing guidelines | `**/prisma/**,**/prisma.ts,**/drizzle/**,**/services/**` |
| **Quality** |||
| `testing.instructions.md` | Defines test runner (Vitest/Jest), file naming (*.test.ts), describe/it block structure, mocking strategy (jest.mock for modules, dependency injection), coverage thresholds (e.g. 80%), focus on unit testing functions/hooks/utilities, and what must vs should be tested | `**/tests/**,**/*.test.*,**/*.spec.*` |
| `error-handling.instructions.md` | Defines custom error class hierarchy (AppError → NotFoundError, ValidationError), try/catch placement (service layer, not controllers), error propagation rules, structured logging format, user-facing vs internal error messages, and error boundary patterns in UI | `**/*.ts,**/*.tsx,**/*.js,**/*.jsx` |
| **Ops** |||
| `git.instructions.md` | Enforces conventional commits (feat:, fix:, chore:), branch naming (feature/, bugfix/, hotfix/), PR title format matching commit convention, squash merge preference, required PR description sections (what/why/testing), and changelog generation rules | `**/.github/**,**/.husky/**` |
| `security.instructions.md` | Covers OWASP top 10 awareness, input sanitization on all user input, parameterized queries only (no string interpolation in SQL), CSP/CORS configuration via next.config.ts, JWT handling (short expiry, httpOnly cookies), Next.js middleware for auth, secrets via env variables only, and dependency audit frequency | `**/proxy.ts,**/middleware/**,**/auth/**,**/api/**` |

### 2. Agents `.github/agents/`

**Content rules:**
- Open with a strong identity line — who this agent is and what it cares about
- Define the agent's expertise boundaries — what it handles and what it defers
- Embed project-specific standards directly — agents don't auto-inherit instruction files
- Include decision-making principles — how the agent evaluates trade-offs
- Define response format — how the agent structures its output
- Add interaction style — does it ask clarifying questions? does it give options?
- Include escalation rules — when the agent should flag something to the developer instead of deciding alone
- Keep personality consistent and opinionated — vague agents give vague answers

| File | Role | Embedded Standards |
|---|---|---|
| `spec-builder.agent.md` | **Specification Development** — Creates comprehensive, business-focused specifications (product specs, feature specs, workflow specs) that define requirements, user flows, acceptance criteria, and success metrics without technical implementation details. Translates business needs into clear, testable requirements that serve as the foundation for development planning. Never includes code examples, technology choices, or implementation approaches | Requirements gathering framework, user story format (As a..., I want..., So that...), acceptance criteria structure (Given/When/Then), epic vs feature vs story hierarchy, definition of done criteria, specification templates, stakeholder communication patterns |
| `planner.agent.md` | **Implementation Planning** — Takes a feature/task description, analyzes impact across layers (route → API handler → service → model → migration → component → test), produces a step-by-step implementation plan with file list, dependencies, Server vs Client Component decisions, risks, and open questions before any code is written | Next.js App Router architecture, folder structure, module boundaries, tech stack constraints (React Server Components, Server Actions), database migration strategy, third-party service dependencies |
| `coder.agent.md` | **Code Generation & Standards** — Writes production-ready Next.js code following project conventions, scaffolds full vertical slices (migration → Prisma model → service → API route/Server Action → component → types), applies proper TypeScript types, respects Server/Client component boundaries, and refuses to generate code that violates project patterns | TypeScript strict mode, naming conventions (camelCase functions, PascalCase components, UPPER_SNAKE constants), async Server Components, Server Actions with revalidation, API Route handlers, Zod validation, tRPC/API client patterns, component composition |
| `tester.agent.md` | **Test Strategy & Generation** — Generates unit tests covering happy path, edge cases, validation failures, and error scenarios for functions, hooks, and utilities, ensures tests are isolated and deterministic using proper mocking, focuses on business logic testing | Vitest/Jest syntax, test file naming (*.test.ts), `describe`/`it` blocks, `jest.mock()` for modules, React Testing Library patterns (when testing hooks), mock data factories, no test interdependence, coverage targets (80%+), focus on pure functions and utility testing |
| `reviewer.agent.md` | **Code Review & Feedback** — Reviews code against a structured checklist, catches bugs before they ship, flags security holes, identifies missing validation, spots N+1 queries in data fetching, checks error handling, verifies Server/Client component boundaries, and provides concrete fix suggestions with code snippets | OWASP top 10, Zod validation on all inputs, auth checks in API routes/Server Actions, parameterized queries, proper HTTP status codes, consistent error responses, no client-side secrets, proper loading/error states, accessibility (ARIA, semantic HTML) |
| `refactorer.agent.md` | **Refactoring & Optimization** — Identifies code smells and structural issues, extracts large Server Components into smaller units, simplifies complex conditionals, reduces duplication, improves data fetching performance (parallel fetching, caching), applies SOLID principles — all while guaranteeing no behavior change | Single responsibility (small components/functions), DRY extraction thresholds, cyclomatic complexity limits, React hook composition, Server Component data fetching patterns, proper use of `cache()`, `revalidate` strategies, Prisma select/include optimization, bundle size awareness |
| `debugger.agent.md` | **Issue Diagnosis & Resolution** — Takes a bug report or error trace, traces the execution path, identifies root cause (client vs server error, hydration mismatch, stale data), explains why it fails, provides a targeted fix, writes a regression test, and flags similar patterns elsewhere in the codebase | Next.js error handling (error.tsx, not-found.tsx), console logging patterns, React DevTools usage, Network tab analysis for API calls, Server Component debugging with `console.log`, hydration error detection, cache invalidation issues, Prisma query debugging |


### 3. Prompts `.github/prompts/`

**Content rules:**
- Write in imperative voice — you are giving Copilot a mission
- Start with a role/context line so Copilot understands its persona for this task
- Define input (what the user will provide) and output (what Copilot should produce)
- Include a step-by-step procedure — Copilot follows sequential instructions better
- Specify the output format (file list, code blocks, checklist, table)
- Add constraints and guardrails — things Copilot must not do or assume
- Reference instruction files if needed with #instructions to inherit project standards
- Can use variables like ${file}, ${selection} for dynamic context
- Reference the templates in `.setup/templates/`

| File | Purpose | Agent |
|------|---------|-------|
| `make-plan.prompt.md` | Takes a feature request or task description, breaks it into implementation steps, identifies affected files/layers (route, API handler, service, model, migration, component, test), determines Server vs Client component needs, flags risks, and outputs a checklist-style plan before any code is written | Planner |
| `write-code.prompt.md` | Generates production-ready Next.js code from a description or plan — scaffolds full vertical slices (Prisma migration → model → service → API route/Server Action → Zod schema → component) following project conventions, includes proper TypeScript types and JSDoc comments | Coder |
| `write-tests.prompt.md` | Generates unit tests for a given file — tests for utility functions, business logic, data transformations, custom hooks, and services with mocked dependencies, covering edge cases (null/undefined, empty arrays, validation failures, error conditions) | Tester |
| `review-code.prompt.md` | Runs a structured review checklist — checks for security issues (XSS, SQL injection, missing auth), N+1 queries in Prisma, missing input validation (Zod), error handling gaps, TypeScript strict mode compliance, Server/Client component boundaries, naming violations, test coverage, and suggests concrete fixes | Reviewer |
| `refactor-code.prompt.md` | Analyzes code for smells — extracts large components into smaller ones, moves Server Component logic to services, replaces conditionals with object maps or polymorphism, reduces cyclomatic complexity, applies SOLID principles, optimizes Prisma queries with select/include, and ensures no behavior change | Refactor |
| `debug.prompt.md` | Takes a bug description or error trace, identifies the root cause by analyzing the relevant code path (client vs server, hydration, async data), explains why it fails, provides a targeted fix, adds a regression test to prevent recurrence, and suggests related areas to check for the same pattern | Debugger |
| `optimize-code.prompt.md` | Analyzes code for performance issues — identifies N+1 queries (suggests Prisma `include`/nested selects), missing database indexes, unnecessary client-side JavaScript (move to Server Components), cacheable data (suggests Next.js `cache()`, `revalidate`), heavy computations (memoization), and bundle size concerns (dynamic imports, tree-shaking) | Coder |
| `write-docs.prompt.md` | Generates documentation for a module or feature — TSDoc blocks for functions/types, README section explaining usage, API endpoint documentation (method, route, params, response example with types), component prop documentation, and architectural decision notes for complex logic | Coder |
| `create-product-spec.prompt.md` | Generates a Master Product Specification Document (PSD) based on provided materials (mockups, feature descriptions, business context) that defines product vision, business goals, end-to-end workflows, epic-level and feature-level requirements, and serves as the foundation for user story documentation and implementation planning. | Spec Builder |
| `create-workflow-spec.prompt.md` | Generates a high-level, cross-functional end-to-end workflow specification document that describes how multiple user roles interact with core domain objects across their lifecycle. | Spec Builder |
| `create-feature-spec.prompt.md` | Generates a detailed feature specification document that breaks down a product feature into user stories, acceptance criteria, and implementation details, serving as a blueprint for development and testing. | Spec Builder |

### 4. Skills `.github/skills/`

**Content rules:**
- Define a clear trigger — when should this skill be used
- Specify inputs and outputs explicitly with types
- Include error handling — what happens when the skill fails
- Keep skills single-purpose — one skill does one thing well
- Document dependencies — what tools, CLIs, or APIs the skill needs
- Add examples of invocation and expected results
- Skills are best for repeatable operations — if it's a one-off, use a prompt instead

| Skill | Focus |
|-------|-------|
| `analyst/` | Develop specifications (product, workflow, feature) |
| `frontend/` | Develop React Server/Client Components, hooks, state management, App Router patterns, styling with Tailwind |
| `backend/` | Develop API Route handlers, Server Actions, middleware, authentication, services/business logic |
| `database/` | Design Prisma schema, build optimized queries, prepare migrations, handle transactions, optimize performance |
| `testing/` | Write unit tests for functions, hooks, utilities, and services with proper mocking |

## Research First

Before creating content, check [awesome-copilot](https://github.com/github/awesome-copilot):
1. [Collections](https://github.com/github/awesome-copilot/blob/main/docs/README.collections.md)
2. [Instructions](https://github.com/github/awesome-copilot/tree/main/instructions)
3. [Prompts](https://github.com/github/awesome-copilot/tree/main/prompts)

Strategy: exact tech match -> general matches -> adapt to project -> create custom only if nothing exists.

## Quality Checklist

- [ ] Proper YAML frontmatter on all files
- [ ] Language/framework-specific best practices
- [ ] Files cross-reference appropriately
- [ ] Security, performance, and testing addressed
- [ ] Each agent is self-contained with embedded standards
